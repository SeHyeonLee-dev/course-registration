package com.university.registration.domain.enrollment;

import static org.assertj.core.api.Assertions.assertThat;

import com.university.registration.domain.auth.AuthSessionKeys;
import com.university.registration.domain.course.Course;
import com.university.registration.domain.course.repository.CourseRepository;
import com.university.registration.domain.enrollment.dto.EnrollmentApplyRequest;
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
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class EnrollmentConcurrencyTest {

  @Autowired private EnrollmentService enrollmentService;
  @Autowired private EnrollmentRepository enrollmentRepository;
  @Autowired private SectionRepository sectionRepository;
  @Autowired private StudentRepository studentRepository;
  @Autowired private SemesterRepository semesterRepository;
  @Autowired private CourseRepository courseRepository;

  @AfterEach
  void tearDown() {
    enrollmentRepository.deleteAllInBatch();
    sectionRepository.deleteAllInBatch();
    courseRepository.deleteAllInBatch();
    semesterRepository.deleteAllInBatch();
    studentRepository.deleteAllInBatch();
  }

  @Test
  void applyConcurrentlyDoesNotExceedCapacityAndReturnsSoldOutFailures() throws Exception {
    int capacity = 5;
    int requestCount = 20;

    Semester semester =
        semesterRepository.save(
            new Semester(
                "2026-1",
                LocalDate.of(2026, 3, 2),
                LocalDate.of(2026, 6, 20),
                LocalDateTime.now().minusDays(1),
                LocalDateTime.now().plusDays(1)));
    Course course = courseRepository.save(new Course("CSE201", "자료구조", 3, "컴퓨터공학과"));
    Section section =
        sectionRepository.save(
            new Section(semester, course, "01", "김교수", "공학관 101", DayOfWeek.MON, 3, 4, capacity));

    List<Student> students = new ArrayList<>();
    for (int i = 0; i < requestCount; i++) {
      students.add(
          studentRepository.save(new Student(String.format("2023%04d", i + 1), "학생" + i, "pw", 18)));
    }

    ExecutorService executorService = Executors.newFixedThreadPool(requestCount);
    CountDownLatch ready = new CountDownLatch(requestCount);
    CountDownLatch start = new CountDownLatch(1);
    CountDownLatch done = new CountDownLatch(requestCount);
    AtomicInteger successCount = new AtomicInteger();
    AtomicInteger failureCount = new AtomicInteger();
    ConcurrentLinkedQueue<String> failureMessages = new ConcurrentLinkedQueue<>();
    List<Future<?>> futures = new ArrayList<>();

    for (Student student : students) {
      futures.add(
          executorService.submit(
              () -> {
                ready.countDown();
                try {
                  start.await(5, TimeUnit.SECONDS);
                  MockHttpSession session = new MockHttpSession();
                  session.setAttribute(AuthSessionKeys.LOGIN_STUDENT_ID, student.getId());
                  enrollmentService.apply(new EnrollmentApplyRequest(section.getId()), session);
                  successCount.incrementAndGet();
                } catch (BusinessException exception) {
                  failureCount.incrementAndGet();
                  failureMessages.add(exception.getMessage());
                  assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.COURSE_CAPACITY_EXCEEDED);
                } catch (Exception exception) {
                  throw new RuntimeException(exception);
                } finally {
                  done.countDown();
                }
              }));
    }

    ready.await(5, TimeUnit.SECONDS);
    start.countDown();
    done.await(10, TimeUnit.SECONDS);
    for (Future<?> future : futures) {
      future.get();
    }
    executorService.shutdown();

    Section persistedSection =
        sectionRepository.findWithSemesterAndCourseById(section.getId()).orElseThrow();
    int persistedEnrollmentCount =
        enrollmentRepository.findAllBySectionIdOrderByEnrolledAtDesc(section.getId()).size();

    assertThat(successCount.get()).isEqualTo(capacity);
    assertThat(failureCount.get()).isEqualTo(requestCount - capacity);
    assertThat(persistedEnrollmentCount).isEqualTo(capacity);
    assertThat(persistedSection.getCurrentCount()).isEqualTo(capacity);
    assertThat(persistedSection.getCurrentCount()).isLessThanOrEqualTo(capacity);
    assertThat(failureMessages).allMatch("정원 마감"::equals);
  }
}
