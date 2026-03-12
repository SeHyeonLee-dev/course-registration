package com.university.registration.domain.admin;

import com.university.registration.domain.admin.dto.AdminCourseCreateRequest;
import com.university.registration.domain.admin.dto.AdminCourseResponse;
import com.university.registration.domain.admin.dto.AdminSectionCreateRequest;
import com.university.registration.domain.admin.dto.AdminSectionEnrollmentItemResponse;
import com.university.registration.domain.admin.dto.AdminSectionEnrollmentStatusResponse;
import com.university.registration.domain.admin.dto.AdminSectionResponse;
import com.university.registration.domain.admin.dto.AdminSemesterCreateRequest;
import com.university.registration.domain.admin.dto.AdminSemesterResponse;
import com.university.registration.domain.admin.dto.AdminSemesterUpdatePeriodRequest;
import com.university.registration.domain.course.Course;
import com.university.registration.domain.course.repository.CourseRepository;
import com.university.registration.domain.enrollment.Enrollment;
import com.university.registration.domain.enrollment.repository.EnrollmentRepository;
import com.university.registration.domain.section.Section;
import com.university.registration.domain.section.repository.SectionRepository;
import com.university.registration.domain.semester.Semester;
import com.university.registration.domain.semester.repository.SemesterRepository;
import com.university.registration.global.exception.BusinessException;
import com.university.registration.global.exception.ErrorCode;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {
  private final SemesterRepository semesterRepository;
  private final CourseRepository courseRepository;
  private final SectionRepository sectionRepository;
  private final EnrollmentRepository enrollmentRepository;

  @Transactional
  public AdminSemesterResponse createSemester(AdminSemesterCreateRequest request) {
    validateSemesterPeriod(
        request.startDate(),
        request.endDate(),
        request.enrollStartAt(),
        request.enrollEndAt());
    if (semesterRepository.findByName(request.name().trim()).isPresent()) {
      throw new BusinessException(ErrorCode.CONFLICT, "이미 존재하는 학기명입니다.");
    }

    Semester semester =
        semesterRepository.save(
            new Semester(
                request.name().trim(),
                request.startDate(),
                request.endDate(),
                request.enrollStartAt(),
                request.enrollEndAt()));
    return AdminSemesterResponse.from(semester);
  }

  @Transactional
  public AdminSemesterResponse updateEnrollmentPeriod(
      Long semesterId, AdminSemesterUpdatePeriodRequest request) {
    Semester semester =
        semesterRepository
            .findById(semesterId)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "학기를 찾을 수 없습니다."));

    validateEnrollmentWindow(
        semester.getStartDate(), semester.getEndDate(), request.enrollStartAt(), request.enrollEndAt());

    semester.updateEnrollmentPeriod(request.enrollStartAt(), request.enrollEndAt());
    return AdminSemesterResponse.from(semester);
  }

  @Transactional
  public AdminCourseResponse createCourse(AdminCourseCreateRequest request) {
    String courseCode = request.code().trim();
    if (courseRepository.findByCode(courseCode).isPresent()) {
      throw new BusinessException(ErrorCode.CONFLICT, "이미 존재하는 강의 코드입니다.");
    }

    Course course =
        courseRepository.save(
            new Course(
                courseCode,
                request.name().trim(),
                request.credit(),
                request.department() == null ? null : request.department().trim()));
    return AdminCourseResponse.from(course);
  }

  @Transactional
  public AdminSectionResponse createSection(AdminSectionCreateRequest request) {
    if (request.startPeriod() > request.endPeriod()) {
      throw new BusinessException(ErrorCode.INVALID_INPUT, "교시 범위가 올바르지 않습니다.");
    }

    Semester semester =
        semesterRepository
            .findById(request.semesterId())
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "학기를 찾을 수 없습니다."));
    Course course =
        courseRepository
            .findById(request.courseId())
            .orElseThrow(() -> new BusinessException(ErrorCode.COURSE_NOT_FOUND));

    Section section =
        new Section(
            semester,
            course,
            request.sectionNo().trim(),
            request.professorName().trim(),
            request.classroom() == null ? null : request.classroom().trim(),
            request.dayOfWeek(),
            request.startPeriod(),
            request.endPeriod(),
            request.capacity());

    try {
      Section saved = sectionRepository.save(section);
      return AdminSectionResponse.from(saved);
    } catch (DataIntegrityViolationException exception) {
      throw new BusinessException(ErrorCode.CONFLICT, "같은 학기/강의의 분반 번호가 이미 존재합니다.");
    }
  }

  @Transactional(readOnly = true)
  public AdminSectionEnrollmentStatusResponse getSectionEnrollmentStatus(Long sectionId) {
    Section section =
        sectionRepository
            .findWithSemesterAndCourseById(sectionId)
            .orElseThrow(() -> new BusinessException(ErrorCode.COURSE_NOT_FOUND));

    List<Enrollment> enrollments = enrollmentRepository.findAllBySectionIdOrderByEnrolledAtDesc(sectionId);
    List<AdminSectionEnrollmentItemResponse> items =
        enrollments.stream().map(AdminSectionEnrollmentItemResponse::from).toList();

    return new AdminSectionEnrollmentStatusResponse(
        section.getId(),
        section.getSemester().getId(),
        section.getSemester().getName(),
        section.getCourse().getId(),
        section.getCourse().getCode(),
        section.getCourse().getName(),
        section.getSectionNo(),
        section.getProfessorName(),
        section.getDayOfWeek().name(),
        section.getStartPeriod(),
        section.getEndPeriod(),
        section.getCapacity(),
        section.getCurrentCount(),
        section.getCapacity() - section.getCurrentCount(),
        items);
  }

  private void validateSemesterPeriod(
      java.time.LocalDate startDate,
      java.time.LocalDate endDate,
      java.time.LocalDateTime enrollStartAt,
      java.time.LocalDateTime enrollEndAt) {
    if (startDate.isAfter(endDate)) {
      throw new BusinessException(ErrorCode.INVALID_INPUT, "학기 시작일은 종료일보다 늦을 수 없습니다.");
    }
    validateEnrollmentWindow(startDate, endDate, enrollStartAt, enrollEndAt);
  }

  private void validateEnrollmentWindow(
      java.time.LocalDate startDate,
      java.time.LocalDate endDate,
      java.time.LocalDateTime enrollStartAt,
      java.time.LocalDateTime enrollEndAt) {
    if (enrollStartAt.isAfter(enrollEndAt)) {
      throw new BusinessException(ErrorCode.INVALID_INPUT, "신청 시작일시는 종료일시보다 늦을 수 없습니다.");
    }
    if (enrollStartAt.toLocalDate().isAfter(endDate) || enrollEndAt.toLocalDate().isAfter(endDate)) {
      throw new BusinessException(ErrorCode.INVALID_INPUT, "신청 기간은 학기 종료일 이후일 수 없습니다.");
    }
  }
}
