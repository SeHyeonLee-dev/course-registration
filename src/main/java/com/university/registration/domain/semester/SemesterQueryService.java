package com.university.registration.domain.semester;

import com.university.registration.domain.semester.dto.SemesterItemResponse;
import com.university.registration.domain.semester.dto.SemesterListResponse;
import com.university.registration.domain.semester.repository.SemesterRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SemesterQueryService {
  private final SemesterRepository semesterRepository;

  @Transactional(readOnly = true)
  public SemesterListResponse getSemesters(boolean activeOnly) {
    List<Semester> semesters =
        activeOnly ? getActiveSemesters() : semesterRepository.findAllByOrderByStartDateDesc();

    return new SemesterListResponse(semesters.stream().map(SemesterItemResponse::from).toList());
  }

  private List<Semester> getActiveSemesters() {
    LocalDate today = LocalDate.now();
    LocalDateTime now = LocalDateTime.now();

    return semesterRepository
        .findAllByOrderByStartDateDesc().stream()
        .filter(
            semester ->
                (!today.isBefore(semester.getStartDate()) && !today.isAfter(semester.getEndDate()))
                    || (!now.isBefore(semester.getEnrollStartAt())
                        && !now.isAfter(semester.getEnrollEndAt())))
        .toList();
  }
}
