package com.university.registration.domain.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.university.registration.domain.admin.dto.AdminCourseCreateRequest;
import com.university.registration.domain.admin.dto.AdminCourseResponse;
import com.university.registration.domain.admin.dto.AdminSectionCreateRequest;
import com.university.registration.domain.admin.dto.AdminSectionEnrollmentStatusResponse;
import com.university.registration.domain.admin.dto.AdminSectionResponse;
import com.university.registration.domain.admin.dto.AdminSemesterCreateRequest;
import com.university.registration.domain.admin.dto.AdminSemesterResponse;
import com.university.registration.domain.admin.dto.AdminSemesterUpdatePeriodRequest;
import com.university.registration.domain.course.Course;
import com.university.registration.domain.course.repository.CourseRepository;
import com.university.registration.domain.enrollment.Enrollment;
import com.university.registration.domain.enrollment.repository.EnrollmentRepository;
import com.university.registration.domain.section.DayOfWeek;
import com.university.registration.domain.section.Section;
import com.university.registration.domain.section.repository.SectionRepository;
import com.university.registration.domain.semester.Semester;
import com.university.registration.domain.semester.repository.SemesterRepository;
import com.university.registration.domain.student.Student;
import com.university.registration.global.exception.BusinessException;
import com.university.registration.global.exception.ErrorCode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

  @Mock private SemesterRepository semesterRepository;
  @Mock private CourseRepository courseRepository;
  @Mock private SectionRepository sectionRepository;
  @Mock private EnrollmentRepository enrollmentRepository;

  @InjectMocks private AdminService adminService;

  @Test
  void createSemesterSuccess() {
    AdminSemesterCreateRequest request =
        new AdminSemesterCreateRequest(
            "2026-2",
            LocalDate.of(2026, 9, 1),
            LocalDate.of(2026, 12, 20),
            LocalDateTime.of(2026, 8, 25, 9, 0),
            LocalDateTime.of(2026, 8, 29, 18, 0));

    when(semesterRepository.findByName("2026-2")).thenReturn(Optional.empty());
    when(semesterRepository.save(org.mockito.ArgumentMatchers.any(Semester.class)))
        .thenAnswer(
            invocation -> {
              Semester semester = invocation.getArgument(0);
              ReflectionTestUtils.setField(semester, "id", 1L);
              return semester;
            });

    AdminSemesterResponse response = adminService.createSemester(request);

    assertThat(response.semesterId()).isEqualTo(1L);
    assertThat(response.name()).isEqualTo("2026-2");
  }

  @Test
  void createSemesterFailsWhenNameDuplicated() {
    AdminSemesterCreateRequest request =
        new AdminSemesterCreateRequest(
            "2026-2",
            LocalDate.of(2026, 9, 1),
            LocalDate.of(2026, 12, 20),
            LocalDateTime.of(2026, 8, 25, 9, 0),
            LocalDateTime.of(2026, 8, 29, 18, 0));

    when(semesterRepository.findByName("2026-2")).thenReturn(Optional.of(activeSemester(1L)));

    assertThatThrownBy(() -> adminService.createSemester(request))
        .isInstanceOf(BusinessException.class)
        .extracting("errorCode")
        .isEqualTo(ErrorCode.CONFLICT);
  }

  @Test
  void updateEnrollmentPeriodSuccess() {
    Semester semester = activeSemester(1L);
    AdminSemesterUpdatePeriodRequest request =
        new AdminSemesterUpdatePeriodRequest(
            LocalDateTime.of(2026, 2, 20, 9, 0), LocalDateTime.of(2026, 2, 28, 18, 0));

    when(semesterRepository.findById(1L)).thenReturn(Optional.of(semester));

    AdminSemesterResponse response = adminService.updateEnrollmentPeriod(1L, request);

    assertThat(response.enrollStartAt()).isEqualTo(request.enrollStartAt());
    assertThat(response.enrollEndAt()).isEqualTo(request.enrollEndAt());
  }

  @Test
  void createCourseSuccess() {
    AdminCourseCreateRequest request = new AdminCourseCreateRequest("CSE401", "운영체제", 3, "컴퓨터공학과");

    when(courseRepository.findByCode("CSE401")).thenReturn(Optional.empty());
    when(courseRepository.save(org.mockito.ArgumentMatchers.any(Course.class)))
        .thenAnswer(
            invocation -> {
              Course course = invocation.getArgument(0);
              ReflectionTestUtils.setField(course, "id", 10L);
              return course;
            });

    AdminCourseResponse response = adminService.createCourse(request);

    assertThat(response.courseId()).isEqualTo(10L);
    assertThat(response.code()).isEqualTo("CSE401");
  }

  @Test
  void createSectionSuccess() {
    Semester semester = activeSemester(1L);
    Course course = course(10L, "CSE401", 3);
    AdminSectionCreateRequest request =
        new AdminSectionCreateRequest(1L, 10L, "01", "김교수", "공학관 101", DayOfWeek.MON, 1, 3, 40);

    when(semesterRepository.findById(1L)).thenReturn(Optional.of(semester));
    when(courseRepository.findById(10L)).thenReturn(Optional.of(course));
    when(sectionRepository.save(org.mockito.ArgumentMatchers.any(Section.class)))
        .thenAnswer(
            invocation -> {
              Section section = invocation.getArgument(0);
              ReflectionTestUtils.setField(section, "id", 100L);
              return section;
            });

    AdminSectionResponse response = adminService.createSection(request);

    assertThat(response.sectionId()).isEqualTo(100L);
    assertThat(response.courseCode()).isEqualTo("CSE401");
    assertThat(response.capacity()).isEqualTo(40);
  }

  @Test
  void createSectionFailsWhenPeriodInvalid() {
    AdminSectionCreateRequest request =
        new AdminSectionCreateRequest(1L, 10L, "01", "김교수", "공학관 101", DayOfWeek.MON, 4, 3, 40);

    assertThatThrownBy(() -> adminService.createSection(request))
        .isInstanceOf(BusinessException.class)
        .extracting("errorCode")
        .isEqualTo(ErrorCode.INVALID_INPUT);
  }

  @Test
  void createSectionFailsWhenDuplicated() {
    Semester semester = activeSemester(1L);
    Course course = course(10L, "CSE401", 3);
    AdminSectionCreateRequest request =
        new AdminSectionCreateRequest(1L, 10L, "01", "김교수", "공학관 101", DayOfWeek.MON, 1, 3, 40);

    when(semesterRepository.findById(1L)).thenReturn(Optional.of(semester));
    when(courseRepository.findById(10L)).thenReturn(Optional.of(course));
    when(sectionRepository.save(org.mockito.ArgumentMatchers.any(Section.class)))
        .thenThrow(new DataIntegrityViolationException("duplicate"));

    assertThatThrownBy(() -> adminService.createSection(request))
        .isInstanceOf(BusinessException.class)
        .extracting("errorCode")
        .isEqualTo(ErrorCode.CONFLICT);
  }

  @Test
  void getSectionEnrollmentStatusSuccess() {
    Semester semester = activeSemester(1L);
    Course course = course(10L, "CSE401", 3);
    Section section = section(100L, semester, course, 40, 2);
    Student student1 = student(1L, "20230001", "홍길동");
    Student student2 = student(2L, "20230002", "김철수");
    Enrollment enrollment1 =
        enrollment(101L, student1, section, LocalDateTime.of(2026, 3, 10, 10, 0));
    Enrollment enrollment2 =
        enrollment(102L, student2, section, LocalDateTime.of(2026, 3, 10, 9, 0));

    when(sectionRepository.findWithSemesterAndCourseById(100L)).thenReturn(Optional.of(section));
    when(enrollmentRepository.findAllBySectionIdOrderByEnrolledAtDesc(100L))
        .thenReturn(List.of(enrollment1, enrollment2));

    AdminSectionEnrollmentStatusResponse response = adminService.getSectionEnrollmentStatus(100L);

    assertThat(response.sectionId()).isEqualTo(100L);
    assertThat(response.currentCount()).isEqualTo(2);
    assertThat(response.remainingCount()).isEqualTo(38);
    assertThat(response.enrollments()).hasSize(2);
    assertThat(response.enrollments().get(0).studentNumber()).isEqualTo("20230001");
  }

  private Semester activeSemester(Long id) {
    Semester semester =
        new Semester(
            "2026-1",
            LocalDate.of(2026, 3, 2),
            LocalDate.of(2026, 6, 20),
            LocalDateTime.of(2026, 2, 25, 9, 0),
            LocalDateTime.of(2026, 2, 28, 18, 0));
    ReflectionTestUtils.setField(semester, "id", id);
    return semester;
  }

  private Course course(Long id, String code, Integer credit) {
    Course course = new Course(code, code + "_NAME", credit, "컴퓨터공학과");
    ReflectionTestUtils.setField(course, "id", id);
    return course;
  }

  private Section section(Long id, Semester semester, Course course, Integer capacity, Integer currentCount) {
    Section section =
        new Section(semester, course, "01", "김교수", "공학관 101", DayOfWeek.MON, 1, 3, capacity);
    ReflectionTestUtils.setField(section, "id", id);
    ReflectionTestUtils.setField(section, "currentCount", currentCount);
    return section;
  }

  private Student student(Long id, String studentNumber, String name) {
    Student student = new Student(studentNumber, name, "pw", 18);
    ReflectionTestUtils.setField(student, "id", id);
    return student;
  }

  private Enrollment enrollment(Long id, Student student, Section section, LocalDateTime enrolledAt) {
    Enrollment enrollment = new Enrollment(student, section);
    ReflectionTestUtils.setField(enrollment, "id", id);
    ReflectionTestUtils.setField(enrollment, "enrolledAt", enrolledAt);
    return enrollment;
  }
}
