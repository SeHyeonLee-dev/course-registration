package com.university.registration.domain.enrollment.repository;

import com.university.registration.domain.enrollment.Enrollment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
  List<Enrollment> findByStudentId(Long studentId);

  boolean existsByStudentIdAndSectionId(Long studentId, Long sectionId);

  boolean existsByStudentIdAndSectionCourseIdAndSectionSemesterId(
      Long studentId, Long courseId, Long semesterId);

  @EntityGraph(attributePaths = {"student", "section", "section.course", "section.semester"})
  Optional<Enrollment> findWithStudentAndSectionSemesterCourseById(Long id);

  @EntityGraph(attributePaths = {"section", "section.course", "section.semester"})
  List<Enrollment> findAllByStudentIdOrderByEnrolledAtDesc(Long studentId);

  @EntityGraph(attributePaths = {"section", "section.course", "section.semester"})
  List<Enrollment> findAllByStudentIdAndSectionSemesterIdOrderByEnrolledAtDesc(
      Long studentId, Long semesterId);

  @EntityGraph(attributePaths = {"student", "section", "section.course", "section.semester"})
  List<Enrollment> findAllBySectionIdOrderByEnrolledAtDesc(Long sectionId);
}
