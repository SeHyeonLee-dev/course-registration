package com.university.registration.domain.admin.dto;

import com.university.registration.domain.course.Course;

public record AdminCourseResponse(
    Long courseId, String code, String name, Integer credit, String department) {

  public static AdminCourseResponse from(Course course) {
    return new AdminCourseResponse(
        course.getId(), course.getCode(), course.getName(), course.getCredit(), course.getDepartment());
  }
}
