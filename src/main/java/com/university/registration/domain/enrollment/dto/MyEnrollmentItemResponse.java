package com.university.registration.domain.enrollment.dto;

import com.university.registration.domain.enrollment.Enrollment;
import java.time.LocalDateTime;

public record MyEnrollmentItemResponse(
    Long enrollmentId,
    Long sectionId,
    Long semesterId,
    String semesterName,
    String courseCode,
    String courseName,
    Integer credit,
    String sectionNo,
    String professorName,
    String dayOfWeek,
    Integer startPeriod,
    Integer endPeriod,
    LocalDateTime enrolledAt) {

  public static MyEnrollmentItemResponse from(Enrollment enrollment) {
    return new MyEnrollmentItemResponse(
        enrollment.getId(),
        enrollment.getSection().getId(),
        enrollment.getSection().getSemester().getId(),
        enrollment.getSection().getSemester().getName(),
        enrollment.getSection().getCourse().getCode(),
        enrollment.getSection().getCourse().getName(),
        enrollment.getSection().getCourse().getCredit(),
        enrollment.getSection().getSectionNo(),
        enrollment.getSection().getProfessorName(),
        enrollment.getSection().getDayOfWeek().name(),
        enrollment.getSection().getStartPeriod(),
        enrollment.getSection().getEndPeriod(),
        enrollment.getEnrolledAt());
  }
}
