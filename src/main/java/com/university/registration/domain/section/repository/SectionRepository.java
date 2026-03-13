package com.university.registration.domain.section.repository;

import com.university.registration.domain.section.Section;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.LockModeType;

public interface SectionRepository
    extends JpaRepository<Section, Long>, JpaSpecificationExecutor<Section> {

  @EntityGraph(attributePaths = {"semester", "course"})
  Page<Section> findAll(Specification<Section> specification, Pageable pageable);

  @EntityGraph(attributePaths = {"semester", "course"})
  Optional<Section> findWithSemesterAndCourseById(Long id);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select s from Section s join fetch s.semester join fetch s.course where s.id = :id")
  Optional<Section> findWithSemesterAndCourseByIdForUpdate(Long id);
}
