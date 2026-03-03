package com.university.registration.domain.section;

import com.university.registration.domain.section.dto.SectionListItemResponse;
import com.university.registration.domain.section.dto.SectionListResponse;
import com.university.registration.domain.section.repository.SectionRepository;
import com.university.registration.domain.section.repository.SectionSpecifications;
import com.university.registration.domain.semester.repository.SemesterRepository;
import com.university.registration.global.exception.BusinessException;
import com.university.registration.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SectionQueryService {
  private final SectionRepository sectionRepository;
  private final SemesterRepository semesterRepository;

  @Transactional(readOnly = true)
  public SectionListResponse getSections(
      Long semesterId, String keyword, DayOfWeek dayOfWeek, int page, int size) {
    if (!semesterRepository.existsById(semesterId)) {
      throw new BusinessException(ErrorCode.NOT_FOUND);
    }

    Specification<Section> specification =
        SectionSpecifications.hasSemesterId(semesterId)
            .and(SectionSpecifications.hasKeyword(keyword))
            .and(SectionSpecifications.hasDayOfWeek(dayOfWeek));

    Page<Section> sectionPage =
        sectionRepository.findAll(
            specification, PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id")));

    return new SectionListResponse(
        sectionPage.getContent().stream().map(SectionListItemResponse::from).toList(),
        sectionPage.getNumber(),
        sectionPage.getSize(),
        sectionPage.getTotalElements(),
        sectionPage.getTotalPages());
  }
}
