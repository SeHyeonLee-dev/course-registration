package com.university.registration.domain.enrollment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.university.registration.domain.auth.AuthSessionKeys;
import com.university.registration.domain.course.Course;
import com.university.registration.domain.enrollment.dto.EnrollmentApplyRequest;
import com.university.registration.domain.enrollment.dto.EnrollmentApplyResponse;
import com.university.registration.domain.enrollment.dto.MyEnrollmentResponse;
import com.university.registration.domain.enrollment.repository.EnrollmentRepository;
import com.university.registration.domain.section.DayOfWeek;
import com.university.registration.domain.section.Section;
import com.university.registration.domain.section.repository.SectionRepository;
import com.university.registration.domain.semester.Semester;
import com.university.registration.domain.semester.repository.SemesterRepository;
import com.university.registration.domain.student.Student;
import com.university.registration.domain.student.repository.StudentRepository;
import com.university.registration.global.exception.BusinessException;
import com.university.registration.global.exception.ErrorCode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {

  @Mock private EnrollmentRepository enrollmentRepository;
  @Mock private SectionRepository sectionRepository;
  @Mock private StudentRepository studentRepository;
  @Mock private SemesterRepository semesterRepository;

  @InjectMocks private EnrollmentService enrollmentService;

  @Test
  void applySuccess() {
    MockHttpSession session = session(1L);
    Student student = student(1L, 18);
    Semester semester = activeSemester(1L);
    Course course = course(10L, "CSE201", 3);
    Section section = section(1L, semester, course, DayOfWeek.MON, 3, 4, 40, 0);

    when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
    when(sectionRepository.findWithSemesterAndCourseByIdForUpdate(1L)).thenReturn(Optional.of(section));
    when(enrollmentRepository.existsByStudentIdAndSectionId(1L, 1L)).thenReturn(false);
    when(enrollmentRepository.existsByStudentIdAndSectionCourseIdAndSectionSemesterId(1L, 10L, 1L))
        .thenReturn(false);
    when(enrollmentRepository.findAllByStudentIdAndSectionSemesterIdOrderByEnrolledAtDesc(1L, 1L))
        .thenReturn(List.of());
    when(enrollmentRepository.saveAndFlush(any(Enrollment.class)))
        .thenAnswer(
            invocation -> {
              Enrollment enrollment = invocation.getArgument(0);
              ReflectionTestUtils.setField(enrollment, "id", 101L);
              ReflectionTestUtils.setField(
                  enrollment, "enrolledAt", LocalDateTime.of(2026, 3, 4, 10, 0));
              return enrollment;
            });

    EnrollmentApplyResponse response = enrollmentService.apply(new EnrollmentApplyRequest(1L), session);

    assertThat(response.enrollmentId()).isEqualTo(101L);
    assertThat(response.studentId()).isEqualTo(1L);
    assertThat(response.sectionId()).isEqualTo(1L);
    assertThat(section.getCurrentCount()).isEqualTo(1);
  }

  @Test
  void applyFailsWhenOutOfEnrollmentPeriod() {
    MockHttpSession session = session(1L);
    Student student = student(1L, 18);
    Semester semester = closedSemester(1L);
    Course course = course(10L, "CSE201", 3);
    Section section = section(1L, semester, course, DayOfWeek.MON, 3, 4, 40, 0);

    when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
    when(sectionRepository.findWithSemesterAndCourseByIdForUpdate(1L)).thenReturn(Optional.of(section));

    assertThatThrownBy(() -> enrollmentService.apply(new EnrollmentApplyRequest(1L), session))
        .isInstanceOf(BusinessException.class)
        .extracting("errorCode")
        .isEqualTo(ErrorCode.COURSE_CLOSED);
  }

  @Test
  void applyFailsWhenAlreadyAppliedForSameSection() {
    MockHttpSession session = session(1L);
    Student student = student(1L, 18);
    Semester semester = activeSemester(1L);
    Course course = course(10L, "CSE201", 3);
    Section section = section(1L, semester, course, DayOfWeek.MON, 3, 4, 40, 0);

    when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
    when(sectionRepository.findWithSemesterAndCourseByIdForUpdate(1L)).thenReturn(Optional.of(section));
    when(enrollmentRepository.existsByStudentIdAndSectionId(1L, 1L)).thenReturn(true);

    assertThatThrownBy(() -> enrollmentService.apply(new EnrollmentApplyRequest(1L), session))
        .isInstanceOf(BusinessException.class)
        .extracting("errorCode")
        .isEqualTo(ErrorCode.REG_ALREADY_REGISTERED);
  }

  @Test
  void applyFailsWhenAlreadyAppliedForSameCourseInSemester() {
    MockHttpSession session = session(1L);
    Student student = student(1L, 18);
    Semester semester = activeSemester(1L);
    Course course = course(10L, "CSE201", 3);
    Section section = section(2L, semester, course, DayOfWeek.MON, 3, 4, 40, 0);

    when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
    when(sectionRepository.findWithSemesterAndCourseByIdForUpdate(2L)).thenReturn(Optional.of(section));
    when(enrollmentRepository.existsByStudentIdAndSectionId(1L, 2L)).thenReturn(false);
    when(enrollmentRepository.existsByStudentIdAndSectionCourseIdAndSectionSemesterId(1L, 10L, 1L))
        .thenReturn(true);

    assertThatThrownBy(() -> enrollmentService.apply(new EnrollmentApplyRequest(2L), session))
        .isInstanceOf(BusinessException.class)
        .extracting("errorCode")
        .isEqualTo(ErrorCode.REG_ALREADY_REGISTERED);
  }

  @Test
  void applyFailsWhenTimetableConflicted() {
    MockHttpSession session = session(1L);
    Student student = student(1L, 18);
    Semester semester = activeSemester(1L);
    Course targetCourse = course(10L, "CSE201", 3);
    Course existingCourse = course(11L, "CSE301", 3);
    Section targetSection = section(1L, semester, targetCourse, DayOfWeek.MON, 3, 4, 40, 0);
    Section existingSection = section(2L, semester, existingCourse, DayOfWeek.MON, 4, 5, 40, 10);
    Enrollment existingEnrollment = enrollment(10L, student, existingSection);

    when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
    when(sectionRepository.findWithSemesterAndCourseByIdForUpdate(1L)).thenReturn(Optional.of(targetSection));
    when(enrollmentRepository.existsByStudentIdAndSectionId(1L, 1L)).thenReturn(false);
    when(enrollmentRepository.existsByStudentIdAndSectionCourseIdAndSectionSemesterId(1L, 10L, 1L))
        .thenReturn(false);
    when(enrollmentRepository.findAllByStudentIdAndSectionSemesterIdOrderByEnrolledAtDesc(1L, 1L))
        .thenReturn(List.of(existingEnrollment));

    assertThatThrownBy(() -> enrollmentService.apply(new EnrollmentApplyRequest(1L), session))
        .isInstanceOf(BusinessException.class)
        .extracting("errorCode")
        .isEqualTo(ErrorCode.CONFLICT);
  }

  @Test
  void applyFailsWhenCreditLimitExceeded() {
    MockHttpSession session = session(1L);
    Student student = student(1L, 3);
    Semester semester = activeSemester(1L);
    Course targetCourse = course(10L, "CSE201", 3);
    Course existingCourse = course(11L, "CSE301", 3);
    Section targetSection = section(1L, semester, targetCourse, DayOfWeek.MON, 5, 6, 40, 0);
    Section existingSection = section(2L, semester, existingCourse, DayOfWeek.TUE, 1, 2, 40, 10);
    Enrollment existingEnrollment = enrollment(10L, student, existingSection);

    when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
    when(sectionRepository.findWithSemesterAndCourseByIdForUpdate(1L)).thenReturn(Optional.of(targetSection));
    when(enrollmentRepository.existsByStudentIdAndSectionId(1L, 1L)).thenReturn(false);
    when(enrollmentRepository.existsByStudentIdAndSectionCourseIdAndSectionSemesterId(1L, 10L, 1L))
        .thenReturn(false);
    when(enrollmentRepository.findAllByStudentIdAndSectionSemesterIdOrderByEnrolledAtDesc(1L, 1L))
        .thenReturn(List.of(existingEnrollment));

    assertThatThrownBy(() -> enrollmentService.apply(new EnrollmentApplyRequest(1L), session))
        .isInstanceOf(BusinessException.class)
        .extracting("errorCode")
        .isEqualTo(ErrorCode.CONFLICT);
  }

  @Test
  void applyFailsWhenCapacityExceeded() {
    MockHttpSession session = session(1L);
    Student student = student(1L, 18);
    Semester semester = activeSemester(1L);
    Course course = course(10L, "CSE201", 3);
    Section section = section(1L, semester, course, DayOfWeek.MON, 3, 4, 40, 40);

    when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
    when(sectionRepository.findWithSemesterAndCourseByIdForUpdate(1L)).thenReturn(Optional.of(section));
    when(enrollmentRepository.existsByStudentIdAndSectionId(1L, 1L)).thenReturn(false);
    when(enrollmentRepository.existsByStudentIdAndSectionCourseIdAndSectionSemesterId(1L, 10L, 1L))
        .thenReturn(false);
    when(enrollmentRepository.findAllByStudentIdAndSectionSemesterIdOrderByEnrolledAtDesc(1L, 1L))
        .thenReturn(List.of());

    assertThatThrownBy(() -> enrollmentService.apply(new EnrollmentApplyRequest(1L), session))
        .isInstanceOf(BusinessException.class)
        .hasMessage("정원 마감")
        .extracting("errorCode")
        .isEqualTo(ErrorCode.COURSE_CAPACITY_EXCEEDED);
  }

  @Test
  void cancelSuccess() {
    MockHttpSession session = session(1L);
    Student student = student(1L, 18);
    Semester semester = activeSemester(1L);
    Course course = course(10L, "CSE201", 3);
    Section section = section(1L, semester, course, DayOfWeek.MON, 3, 4, 40, 1);
    Enrollment enrollment = enrollment(101L, student, section);

    when(enrollmentRepository.findWithStudentAndSectionSemesterCourseById(101L))
        .thenReturn(Optional.of(enrollment));
    when(sectionRepository.findWithSemesterAndCourseByIdForUpdate(1L)).thenReturn(Optional.of(section));

    enrollmentService.cancel(101L, session);

    assertThat(section.getCurrentCount()).isEqualTo(0);
    verify(enrollmentRepository).delete(enrollment);
  }

  @Test
  void cancelFailsWhenEnrollmentOwnerDifferent() {
    MockHttpSession session = session(1L);
    Student owner = student(2L, 18);
    Semester semester = activeSemester(1L);
    Course course = course(10L, "CSE201", 3);
    Section section = section(1L, semester, course, DayOfWeek.MON, 3, 4, 40, 1);
    Enrollment enrollment = enrollment(101L, owner, section);

    when(enrollmentRepository.findWithStudentAndSectionSemesterCourseById(101L))
        .thenReturn(Optional.of(enrollment));

    assertThatThrownBy(() -> enrollmentService.cancel(101L, session))
        .isInstanceOf(BusinessException.class)
        .extracting("errorCode")
        .isEqualTo(ErrorCode.REG_NOT_FOUND);
    verify(enrollmentRepository, never()).delete(any(Enrollment.class));
  }

  @Test
  void getMyEnrollmentsReturnsItemsAndTimetable() {
    MockHttpSession session = session(1L);
    Student student = student(1L, 18);
    Semester semester = activeSemester(1L);
    Course ds = course(10L, "CSE201", 3);
    Course algo = course(11L, "CSE301", 3);
    Section dsSection = section(1L, semester, ds, DayOfWeek.MON, 3, 4, 40, 10);
    Section algoSection = section(2L, semester, algo, DayOfWeek.WED, 1, 2, 40, 12);
    Enrollment e1 = enrollment(101L, student, dsSection, LocalDateTime.of(2026, 3, 4, 10, 0));
    Enrollment e2 = enrollment(102L, student, algoSection, LocalDateTime.of(2026, 3, 4, 11, 0));

    when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
    when(enrollmentRepository.findAllByStudentIdOrderByEnrolledAtDesc(1L)).thenReturn(List.of(e2, e1));

    MyEnrollmentResponse response = enrollmentService.getMyEnrollments(null, session);

    assertThat(response.appliedCredit()).isEqualTo(6);
    assertThat(response.remainingCredit()).isEqualTo(12);
    assertThat(response.items()).hasSize(2);
    assertThat(response.items().get(0).courseCode()).isEqualTo("CSE301");

    Map<String, List<com.university.registration.domain.enrollment.dto.MyTimetableItemResponse>>
        timetable = response.timetable();
    assertThat(timetable.get("MON")).hasSize(1);
    assertThat(timetable.get("WED")).hasSize(1);
    assertThat(timetable.get("FRI")).isEmpty();
  }

  private MockHttpSession session(Long studentId) {
    MockHttpSession session = new MockHttpSession();
    session.setAttribute(AuthSessionKeys.LOGIN_STUDENT_ID, studentId);
    return session;
  }

  private Student student(Long id, Integer maxCredit) {
    Student student = new Student("20230001", "홍길동", "pw", maxCredit);
    ReflectionTestUtils.setField(student, "id", id);
    return student;
  }

  private Semester activeSemester(Long id) {
    LocalDateTime now = LocalDateTime.now();
    Semester semester =
        new Semester(
            "2026-1",
            LocalDate.of(2026, 3, 2),
            LocalDate.of(2026, 6, 20),
            now.minusDays(1),
            now.plusDays(1));
    ReflectionTestUtils.setField(semester, "id", id);
    return semester;
  }

  private Semester closedSemester(Long id) {
    LocalDateTime now = LocalDateTime.now();
    Semester semester =
        new Semester(
            "2026-1",
            LocalDate.of(2026, 3, 2),
            LocalDate.of(2026, 6, 20),
            now.minusDays(5),
            now.minusDays(1));
    ReflectionTestUtils.setField(semester, "id", id);
    return semester;
  }

  private Course course(Long id, String code, Integer credit) {
    Course course = new Course(code, code + "_NAME", credit, "컴퓨터공학과");
    ReflectionTestUtils.setField(course, "id", id);
    return course;
  }

  private Section section(
      Long id,
      Semester semester,
      Course course,
      DayOfWeek dayOfWeek,
      Integer startPeriod,
      Integer endPeriod,
      Integer capacity,
      Integer currentCount) {
    Section section =
        new Section(
            semester, course, "01", "김교수", "공학관 101", dayOfWeek, startPeriod, endPeriod, capacity);
    ReflectionTestUtils.setField(section, "id", id);
    ReflectionTestUtils.setField(section, "currentCount", currentCount);
    return section;
  }

  private Enrollment enrollment(Long id, Student student, Section section) {
    return enrollment(id, student, section, LocalDateTime.now());
  }

  private Enrollment enrollment(Long id, Student student, Section section, LocalDateTime enrolledAt) {
    Enrollment enrollment = new Enrollment(student, section);
    ReflectionTestUtils.setField(enrollment, "id", id);
    ReflectionTestUtils.setField(enrollment, "enrolledAt", enrolledAt);
    return enrollment;
  }
}
