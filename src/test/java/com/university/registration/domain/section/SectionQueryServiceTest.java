package com.university.registration.domain.section;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.university.registration.domain.course.Course;
import com.university.registration.domain.section.dto.SectionListResponse;
import com.university.registration.domain.section.repository.SectionRepository;
import com.university.registration.domain.semester.Semester;
import com.university.registration.domain.semester.repository.SemesterRepository;
import com.university.registration.global.exception.BusinessException;
import com.university.registration.global.exception.ErrorCode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class SectionQueryServiceTest {

  @Mock private SectionRepository sectionRepository;
  @Mock private SemesterRepository semesterRepository;

  @InjectMocks private SectionQueryService sectionQueryService;

  @Captor private ArgumentCaptor<Pageable> pageableCaptor;

  @Test
  void throwsNotFoundWhenSemesterDoesNotExist() {
    when(semesterRepository.existsById(1L)).thenReturn(false);

    assertThatThrownBy(() -> sectionQueryService.getSections(1L, null, null, 0, 20))
        .isInstanceOf(BusinessException.class)
        .extracting("errorCode")
        .isEqualTo(ErrorCode.NOT_FOUND);
  }

  @Test
  void returnsPagedSectionList() {
    Semester semester =
        semester(
            1L,
            "2026-1",
            LocalDate.of(2026, 3, 2),
            LocalDate.of(2026, 6, 20),
            LocalDateTime.of(2026, 2, 20, 10, 0),
            LocalDateTime.of(2026, 3, 8, 23, 59, 59));
    Course course = course(10L, "CSE201", "자료구조", 3, "컴퓨터공학과");
    Section section = section(1L, semester, course, 40, 27);

    when(semesterRepository.existsById(1L)).thenReturn(true);
    Page<Section> page = new PageImpl<>(List.of(section), PageRequest.of(0, 20), 1);
    when(sectionRepository.findAll(anySpecification(), any(Pageable.class))).thenReturn(page);

    SectionListResponse response = sectionQueryService.getSections(1L, "자료", DayOfWeek.MON, 0, 20);

    verify(sectionRepository).findAll(anySpecification(), pageableCaptor.capture());
    Pageable pageable = pageableCaptor.getValue();
    assertThat(pageable.getPageNumber()).isEqualTo(0);
    assertThat(pageable.getPageSize()).isEqualTo(20);

    assertThat(response.content()).hasSize(1);
    assertThat(response.content().get(0).sectionId()).isEqualTo(1L);
    assertThat(response.content().get(0).semesterName()).isEqualTo("2026-1");
    assertThat(response.content().get(0).courseCode()).isEqualTo("CSE201");
    assertThat(response.content().get(0).dayOfWeek()).isEqualTo("MON");
    assertThat(response.content().get(0).remainingCount()).isEqualTo(13);
    assertThat(response.page()).isEqualTo(0);
    assertThat(response.size()).isEqualTo(20);
    assertThat(response.totalElements()).isEqualTo(1L);
    assertThat(response.totalPages()).isEqualTo(1);
    verify(semesterRepository).existsById(eq(1L));
  }

  private Semester semester(
      Long id,
      String name,
      LocalDate startDate,
      LocalDate endDate,
      LocalDateTime enrollStartAt,
      LocalDateTime enrollEndAt) {
    Semester semester = new Semester(name, startDate, endDate, enrollStartAt, enrollEndAt);
    ReflectionTestUtils.setField(semester, "id", id);
    return semester;
  }

  private Course course(Long id, String code, String name, Integer credit, String department) {
    Course course = new Course(code, name, credit, department);
    ReflectionTestUtils.setField(course, "id", id);
    return course;
  }

  private Section section(
      Long id, Semester semester, Course course, Integer capacity, Integer currentCount) {
    Section section =
        new Section(semester, course, "01", "김교수", "공학관 101", DayOfWeek.MON, 3, 4, capacity);
    ReflectionTestUtils.setField(section, "id", id);
    ReflectionTestUtils.setField(section, "currentCount", currentCount);
    return section;
  }

  @SuppressWarnings("unchecked")
  private Specification<Section> anySpecification() {
    return (Specification<Section>) any(Specification.class);
  }
}
