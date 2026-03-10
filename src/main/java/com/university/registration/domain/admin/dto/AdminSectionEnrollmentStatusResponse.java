package com.university.registration.domain.admin.dto;

import java.util.List;

public record AdminSectionEnrollmentStatusResponse(
    Long sectionId,
    Long semesterId,
    String semesterName,
    Long courseId,
    String courseCode,
    String courseName,
    String sectionNo,
    String professorName,
    String dayOfWeek,
    Integer startPeriod,
    Integer endPeriod,
    Integer capacity,
    Integer currentCount,
    Integer remainingCount,
    List<AdminSectionEnrollmentItemResponse> enrollments) {}
