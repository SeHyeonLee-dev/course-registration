package com.university.registration.domain.semester.repository;

import com.university.registration.domain.semester.Semester;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SemesterRepository extends JpaRepository<Semester, Long> {
  Optional<Semester> findByName(String name);

  List<Semester> findAllByOrderByStartDateDesc();
}
