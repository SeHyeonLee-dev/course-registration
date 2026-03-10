package com.university.registration.domain.semester;

import com.university.registration.domain.semester.dto.SemesterListResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/semesters")
public class SemesterController {
  private final SemesterQueryService semesterQueryService;

  @GetMapping
  public SemesterListResponse getSemesters(
      @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
    return semesterQueryService.getSemesters(activeOnly);
  }
}
