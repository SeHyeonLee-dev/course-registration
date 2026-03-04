package com.university.registration.domain.section.dto;

import com.university.registration.domain.section.Section;

public record SectionDetailResponse(
    Long sectionId,
    Long semesterId,
    String semesterName,
    CourseInfo course,
    String sectionNo,
    String professorName,
    String classroom,
    String dayOfWeek,
    Integer startPeriod,
    Integer endPeriod,
    Integer capacity,
    Integer currentCount,
    Integer remainingCount) {

  public static SectionDetailResponse from(Section section) {
    return new SectionDetailResponse(
        section.getId(),
        section.getSemester().getId(),
        section.getSemester().getName(),
        new CourseInfo(
            section.getCourse().getId(),
            section.getCourse().getCode(),
            section.getCourse().getName(),
            section.getCourse().getCredit(),
            section.getCourse().getDepartment()),
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

  public record CourseInfo(
      Long courseId, String code, String name, Integer credit, String department) {}
}
