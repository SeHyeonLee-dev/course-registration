package com.university.registration.domain.enrollment.repository;

import com.university.registration.domain.enrollment.Enrollment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
  List<Enrollment> findByStudentId(Long studentId);

  boolean existsByStudentIdAndSectionId(Long studentId, Long sectionId);
}
