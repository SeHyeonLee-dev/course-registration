package com.university.registration.domain.section.repository;

import com.university.registration.domain.section.Section;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SectionRepository extends JpaRepository<Section, Long> {
  List<Section> findBySemesterId(Long semesterId);
}
