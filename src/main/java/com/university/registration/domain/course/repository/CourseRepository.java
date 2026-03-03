package com.university.registration.domain.course.repository;

import com.university.registration.domain.course.Course;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
  Optional<Course> findByCode(String code);
}
