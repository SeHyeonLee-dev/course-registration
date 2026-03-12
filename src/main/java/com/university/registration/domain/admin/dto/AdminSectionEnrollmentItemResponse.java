package com.university.registration.domain.admin.dto;

import com.university.registration.domain.enrollment.Enrollment;
import java.time.LocalDateTime;

public record AdminSectionEnrollmentItemResponse(
    Long enrollmentId,
    Long studentId,
    String studentNumber,
    String studentName,
    LocalDateTime enrolledAt) {

  public static AdminSectionEnrollmentItemResponse from(Enrollment enrollment) {
    return new AdminSectionEnrollmentItemResponse(
        enrollment.getId(),
        enrollment.getStudent().getId(),
        enrollment.getStudent().getStudentNumber(),
        enrollment.getStudent().getName(),
        enrollment.getEnrolledAt());
  }
}
