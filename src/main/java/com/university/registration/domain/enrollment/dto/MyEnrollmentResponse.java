package com.university.registration.domain.enrollment.dto;

import java.util.List;
import java.util.Map;

public record MyEnrollmentResponse(
    Long studentId,
    Integer maxCredit,
    Integer appliedCredit,
    Integer remainingCredit,
    List<MyEnrollmentItemResponse> items,
    Map<String, List<MyTimetableItemResponse>> timetable) {}
