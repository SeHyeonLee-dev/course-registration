package com.university.registration.domain.semester.dto;

import com.university.registration.domain.semester.Semester;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record SemesterItemResponse(
    Long semesterId,
    String name,
    LocalDate startDate,
    LocalDate endDate,
    LocalDateTime enrollStartAt,
    LocalDateTime enrollEndAt) {

  public static SemesterItemResponse from(Semester semester) {
    return new SemesterItemResponse(
        semester.getId(),
        semester.getName(),
        semester.getStartDate(),
        semester.getEndDate(),
        semester.getEnrollStartAt(),
        semester.getEnrollEndAt());
  }
}
