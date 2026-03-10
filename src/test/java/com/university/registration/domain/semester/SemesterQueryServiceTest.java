package com.university.registration.domain.semester;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.university.registration.domain.semester.dto.SemesterListResponse;
import com.university.registration.domain.semester.repository.SemesterRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class SemesterQueryServiceTest {

  @Mock private SemesterRepository semesterRepository;

  @InjectMocks private SemesterQueryService semesterQueryService;

  @Test
  void getSemestersReturnsAllWhenActiveOnlyFalse() {
    Semester current = semester(1L, "2026-1", LocalDate.now().minusDays(1), LocalDate.now().plusDays(10));
    Semester past = semester(2L, "2025-2", LocalDate.now().minusMonths(6), LocalDate.now().minusMonths(3));

    when(semesterRepository.findAllByOrderByStartDateDesc()).thenReturn(List.of(current, past));

    SemesterListResponse response = semesterQueryService.getSemesters(false);

    assertThat(response.items()).hasSize(2);
    assertThat(response.items().get(0).name()).isEqualTo("2026-1");
    assertThat(response.items().get(1).name()).isEqualTo("2025-2");
  }

  @Test
  void getSemestersReturnsOnlyActiveWhenActiveOnlyTrue() {
    Semester current = semester(1L, "2026-1", LocalDate.now().minusDays(1), LocalDate.now().plusDays(10));
    Semester enrollingOnly =
        semesterWithWindow(
            2L,
            "2026-2",
            LocalDate.now().plusMonths(5),
            LocalDate.now().plusMonths(8),
            LocalDateTime.now().minusHours(1),
            LocalDateTime.now().plusHours(1));
    Semester past = semester(3L, "2025-2", LocalDate.now().minusMonths(6), LocalDate.now().minusMonths(3));

    when(semesterRepository.findAllByOrderByStartDateDesc()).thenReturn(List.of(current, enrollingOnly, past));

    SemesterListResponse response = semesterQueryService.getSemesters(true);

    assertThat(response.items()).hasSize(2);
    assertThat(response.items()).extracting("name").containsExactly("2026-1", "2026-2");
  }

  private Semester semester(Long id, String name, LocalDate startDate, LocalDate endDate) {
    return semesterWithWindow(
        id,
        name,
        startDate,
        endDate,
        LocalDateTime.now().minusDays(5),
        LocalDateTime.now().minusDays(1));
  }

  private Semester semesterWithWindow(
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
}
