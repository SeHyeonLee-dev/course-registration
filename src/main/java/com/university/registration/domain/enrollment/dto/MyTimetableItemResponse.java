package com.university.registration.domain.enrollment.dto;

public record MyTimetableItemResponse(
    Long enrollmentId,
    Long sectionId,
    String courseCode,
    String courseName,
    String sectionNo,
    String professorName,
    Integer startPeriod,
    Integer endPeriod) {

  public static MyTimetableItemResponse from(MyEnrollmentItemResponse enrollmentItem) {
    return new MyTimetableItemResponse(
        enrollmentItem.enrollmentId(),
        enrollmentItem.sectionId(),
        enrollmentItem.courseCode(),
        enrollmentItem.courseName(),
        enrollmentItem.sectionNo(),
        enrollmentItem.professorName(),
        enrollmentItem.startPeriod(),
        enrollmentItem.endPeriod());
  }
}
