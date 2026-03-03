package com.university.registration.domain.auth.dto;

import com.university.registration.domain.student.Student;

public record MeResponse(
    Long studentId, String studentNumber, String name, String role, Integer maxCredit) {
  public static MeResponse from(Student student) {
    return new MeResponse(
        student.getId(),
        student.getStudentNumber(),
        student.getName(),
        "ROLE_" + student.getRole().name(),
        student.getMaxCredit());
  }
}
