package com.university.registration.domain.section;

import com.university.registration.domain.section.dto.SectionListResponse;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/api/sections")
public class SectionController {
  private final SectionQueryService sectionQueryService;

  @GetMapping
  public SectionListResponse getSections(
      @RequestParam Long semesterId,
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) DayOfWeek dayOfWeek,
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
    return sectionQueryService.getSections(semesterId, keyword, dayOfWeek, page, size);
  }
}
