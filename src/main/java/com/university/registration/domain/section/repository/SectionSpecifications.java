package com.university.registration.domain.section.repository;

import com.university.registration.domain.section.DayOfWeek;
import com.university.registration.domain.section.Section;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class SectionSpecifications {

  private SectionSpecifications() {}

  public static Specification<Section> hasSemesterId(Long semesterId) {
    return (root, query, criteriaBuilder) ->
        criteriaBuilder.equal(root.get("semester").get("id"), semesterId);
  }

  public static Specification<Section> hasDayOfWeek(DayOfWeek dayOfWeek) {
    if (dayOfWeek == null) {
      return Specification.where(null);
    }
    return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("dayOfWeek"), dayOfWeek);
  }

  public static Specification<Section> hasKeyword(String keyword) {
    if (!StringUtils.hasText(keyword)) {
      return Specification.where(null);
    }
    String normalizedKeyword = "%" + keyword.trim().toLowerCase() + "%";
    return (root, query, criteriaBuilder) -> {
      var courseJoin = root.join("course");
      return criteriaBuilder.or(
          criteriaBuilder.like(criteriaBuilder.lower(courseJoin.get("name")), normalizedKeyword),
          criteriaBuilder.like(criteriaBuilder.lower(courseJoin.get("code")), normalizedKeyword));
    };
  }
}
