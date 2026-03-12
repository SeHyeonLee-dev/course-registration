package com.university.registration.domain.enrollment;

import com.university.registration.domain.auth.AuthSessionKeys;
import com.university.registration.domain.enrollment.dto.EnrollmentApplyRequest;
import com.university.registration.domain.enrollment.dto.EnrollmentApplyResponse;
import com.university.registration.domain.enrollment.dto.MyEnrollmentItemResponse;
import com.university.registration.domain.enrollment.dto.MyEnrollmentResponse;
import com.university.registration.domain.enrollment.dto.MyTimetableItemResponse;
import com.university.registration.domain.enrollment.repository.EnrollmentRepository;
import com.university.registration.domain.section.Section;
import com.university.registration.domain.section.repository.SectionRepository;
import com.university.registration.domain.semester.Semester;
import com.university.registration.domain.semester.repository.SemesterRepository;
import com.university.registration.domain.student.Student;
import com.university.registration.domain.student.repository.StudentRepository;
import com.university.registration.global.exception.BusinessException;
import com.university.registration.global.exception.ErrorCode;
import jakarta.servlet.http.HttpSession;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EnrollmentService {
  private static final List<String> DAY_ORDER =
      List.of("MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN");

  private final EnrollmentRepository enrollmentRepository;
  private final SectionRepository sectionRepository;
  private final StudentRepository studentRepository;
  private final SemesterRepository semesterRepository;

  @Transactional
  public EnrollmentApplyResponse apply(EnrollmentApplyRequest request, HttpSession session) {
    Long studentId = getAuthenticatedStudentId(session);
    Student student = getStudent(studentId);

    Section section =
        sectionRepository
            .findWithSemesterAndCourseByIdForUpdate(request.sectionId())
            .orElseThrow(() -> new BusinessException(ErrorCode.COURSE_NOT_FOUND));

    validateEnrollmentPeriod(section.getSemester(), LocalDateTime.now());
    validateDuplicate(studentId, section);

    List<Enrollment> currentEnrollments =
        enrollmentRepository.findAllByStudentIdAndSectionSemesterIdOrderByEnrolledAtDesc(
            studentId, section.getSemester().getId());

    validateTimetableConflict(currentEnrollments, section);
    validateCreditLimit(currentEnrollments, student, section);

    if (section.getCurrentCount() >= section.getCapacity()) {
      throw new BusinessException(ErrorCode.COURSE_CAPACITY_EXCEEDED, "정원 마감");
    }
    section.increaseCurrentCount();

    try {
      Enrollment savedEnrollment = enrollmentRepository.saveAndFlush(new Enrollment(student, section));
      return EnrollmentApplyResponse.from(savedEnrollment);
    } catch (DataIntegrityViolationException exception) {
      throw new BusinessException(ErrorCode.REG_ALREADY_REGISTERED);
    }
  }

  @Transactional
  public void cancel(Long enrollmentId, HttpSession session) {
    Long studentId = getAuthenticatedStudentId(session);

    Enrollment enrollment =
        enrollmentRepository
            .findWithStudentAndSectionSemesterCourseById(enrollmentId)
            .orElseThrow(() -> new BusinessException(ErrorCode.REG_NOT_FOUND));

    if (!enrollment.getStudent().getId().equals(studentId)) {
      throw new BusinessException(ErrorCode.REG_NOT_FOUND);
    }

    Section section =
        sectionRepository
            .findWithSemesterAndCourseByIdForUpdate(enrollment.getSection().getId())
            .orElseThrow(() -> new BusinessException(ErrorCode.COURSE_NOT_FOUND));

    validateEnrollmentPeriod(section.getSemester(), LocalDateTime.now(), ErrorCode.REG_CANNOT_CANCEL);

    section.decreaseCurrentCount();
    enrollmentRepository.delete(enrollment);
  }

  @Transactional(readOnly = true)
  public MyEnrollmentResponse getMyEnrollments(Long semesterId, HttpSession session) {
    Long studentId = getAuthenticatedStudentId(session);
    Student student = getStudent(studentId);

    if (semesterId != null && !semesterRepository.existsById(semesterId)) {
      throw new BusinessException(ErrorCode.INVALID_INPUT, "유효하지 않은 학기 ID입니다.");
    }

    List<Enrollment> enrollments =
        semesterId == null
            ? enrollmentRepository.findAllByStudentIdOrderByEnrolledAtDesc(studentId)
            : enrollmentRepository.findAllByStudentIdAndSectionSemesterIdOrderByEnrolledAtDesc(
                studentId, semesterId);

    int appliedCredit = enrollments.stream().mapToInt(e -> e.getSection().getCourse().getCredit()).sum();
    List<MyEnrollmentItemResponse> items = enrollments.stream().map(MyEnrollmentItemResponse::from).toList();

    Map<String, List<MyTimetableItemResponse>> timetable = buildTimetable(items);

    return new MyEnrollmentResponse(
        studentId,
        student.getMaxCredit(),
        appliedCredit,
        student.getMaxCredit() - appliedCredit,
        items,
        timetable);
  }

  private Long getAuthenticatedStudentId(HttpSession session) {
    if (session == null) {
      throw new BusinessException(ErrorCode.UNAUTHORIZED);
    }
    Object loginStudentId = session.getAttribute(AuthSessionKeys.LOGIN_STUDENT_ID);
    if (!(loginStudentId instanceof Long studentId)) {
      throw new BusinessException(ErrorCode.UNAUTHORIZED);
    }
    return studentId;
  }

  private Student getStudent(Long studentId) {
    return studentRepository
        .findById(studentId)
        .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자 정보를 찾을 수 없습니다."));
  }

  private void validateEnrollmentPeriod(Semester semester, LocalDateTime now) {
    validateEnrollmentPeriod(semester, now, ErrorCode.COURSE_CLOSED);
  }

  private void validateEnrollmentPeriod(Semester semester, LocalDateTime now, ErrorCode errorCode) {
    if (now.isBefore(semester.getEnrollStartAt()) || now.isAfter(semester.getEnrollEndAt())) {
      throw new BusinessException(errorCode);
    }
  }

  private void validateDuplicate(Long studentId, Section section) {
    if (enrollmentRepository.existsByStudentIdAndSectionId(studentId, section.getId())) {
      throw new BusinessException(ErrorCode.REG_ALREADY_REGISTERED);
    }

    if (enrollmentRepository.existsByStudentIdAndSectionCourseIdAndSectionSemesterId(
        studentId, section.getCourse().getId(), section.getSemester().getId())) {
      throw new BusinessException(ErrorCode.REG_ALREADY_REGISTERED, "같은 과목은 중복 신청할 수 없습니다.");
    }
  }

  private void validateTimetableConflict(List<Enrollment> currentEnrollments, Section targetSection) {
    boolean conflicted =
        currentEnrollments.stream()
            .map(Enrollment::getSection)
            .anyMatch(
                currentSection ->
                    currentSection.getDayOfWeek() == targetSection.getDayOfWeek()
                        && isOverlapped(
                            currentSection.getStartPeriod(),
                            currentSection.getEndPeriod(),
                            targetSection.getStartPeriod(),
                            targetSection.getEndPeriod()));

    if (conflicted) {
      throw new BusinessException(ErrorCode.CONFLICT, "기존 신청 강의와 시간표가 겹칩니다.");
    }
  }

  private void validateCreditLimit(
      List<Enrollment> currentEnrollments, Student student, Section targetSection) {
    int currentCredit =
        currentEnrollments.stream().mapToInt(e -> e.getSection().getCourse().getCredit()).sum();
    int totalCredit = currentCredit + targetSection.getCourse().getCredit();
    if (totalCredit > student.getMaxCredit()) {
      throw new BusinessException(ErrorCode.CONFLICT, "최대 수강 가능 학점을 초과했습니다.");
    }
  }

  private boolean isOverlapped(int startA, int endA, int startB, int endB) {
    return startA <= endB && startB <= endA;
  }

  private Map<String, List<MyTimetableItemResponse>> buildTimetable(List<MyEnrollmentItemResponse> items) {
    Map<String, List<MyTimetableItemResponse>> grouped = new LinkedHashMap<>();
    for (String day : DAY_ORDER) {
      grouped.put(day, items.stream().filter(item -> day.equals(item.dayOfWeek())).map(MyTimetableItemResponse::from).sorted(Comparator.comparing(MyTimetableItemResponse::startPeriod)).toList());
    }
    return grouped;
  }
}
