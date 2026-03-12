package com.university.registration.domain.admin.dto;

import com.university.registration.domain.section.Section;

public record AdminSectionResponse(
    Long sectionId,
    Long semesterId,
    String semesterName,
    Long courseId,
    String courseCode,
    String courseName,
    String sectionNo,
    String professorName,
    String classroom,
    String dayOfWeek,
    Integer startPeriod,
    Integer endPeriod,
    Integer capacity,
    Integer currentCount) {

  public static AdminSectionResponse from(Section section) {
    return new AdminSectionResponse(
        section.getId(),
        section.getSemester().getId(),
        section.getSemester().getName(),
        section.getCourse().getId(),
        section.getCourse().getCode(),
        section.getCourse().getName(),
        section.getSectionNo(),
        section.getProfessorName(),
        section.getClassroom(),
        section.getDayOfWeek().name(),
        section.getStartPeriod(),
        section.getEndPeriod(),
        section.getCapacity(),
        section.getCurrentCount());
  }
}
