package com.university.registration.domain.enrollment.dto;

import com.university.registration.domain.enrollment.Enrollment;
import java.time.LocalDateTime;

public record EnrollmentApplyResponse(
    Long enrollmentId, Long studentId, Long sectionId, LocalDateTime enrolledAt) {

  public static EnrollmentApplyResponse from(Enrollment enrollment) {
    return new EnrollmentApplyResponse(
        enrollment.getId(),
        enrollment.getStudent().getId(),
        enrollment.getSection().getId(),
        enrollment.getEnrolledAt());
  }
}
