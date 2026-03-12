package com.university.registration.domain.admin.dto;

import com.university.registration.domain.semester.Semester;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AdminSemesterResponse(
    Long semesterId,
    String name,
    LocalDate startDate,
    LocalDate endDate,
    LocalDateTime enrollStartAt,
    LocalDateTime enrollEndAt) {

  public static AdminSemesterResponse from(Semester semester) {
    return new AdminSemesterResponse(
        semester.getId(),
        semester.getName(),
        semester.getStartDate(),
        semester.getEndDate(),
        semester.getEnrollStartAt(),
        semester.getEnrollEndAt());
  }
}
