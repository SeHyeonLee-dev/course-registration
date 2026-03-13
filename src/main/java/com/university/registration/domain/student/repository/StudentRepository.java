package com.university.registration.domain.student.repository;

import com.university.registration.domain.student.Student;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
  Optional<Student> findByStudentNumber(String studentNumber);
}
