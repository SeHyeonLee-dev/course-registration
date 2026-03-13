package com.university.registration.domain.auth.dto;

import com.university.registration.domain.student.Student;

public record LoginResponse(Long studentId, String studentNumber, String name, Integer maxCredit) {
  public static LoginResponse from(Student student) {
    return new LoginResponse(
        student.getId(), student.getStudentNumber(), student.getName(), student.getMaxCredit());
  }
}
