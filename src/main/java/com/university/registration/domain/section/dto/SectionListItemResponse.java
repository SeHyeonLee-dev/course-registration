package com.university.registration.domain.section.dto;

import com.university.registration.domain.section.Section;

public record SectionListItemResponse(
    Long sectionId,
    Long semesterId,
    String semesterName,
    Long courseId,
    String courseCode,
    String courseName,
    Integer credit,
    String department,
    String sectionNo,
    String professorName,
    String classroom,
    String dayOfWeek,
    Integer startPeriod,
    Integer endPeriod,
    Integer capacity,
    Integer currentCount,
    Integer remainingCount) {

  public static SectionListItemResponse from(Section section) {
    return new SectionListItemResponse(
        section.getId(),
        section.getSemester().getId(),
        section.getSemester().getName(),
        section.getCourse().getId(),
        section.getCourse().getCode(),
        section.getCourse().getName(),
        section.getCourse().getCredit(),
        section.getCourse().getDepartment(),
        section.getSectionNo(),
        section.getProfessorName(),
        section.getClassroom(),
        section.getDayOfWeek().name(),
        section.getStartPeriod(),
        section.getEndPeriod(),
        section.getCapacity(),
        section.getCurrentCount(),
        section.getCapacity() - section.getCurrentCount());
  }
}
