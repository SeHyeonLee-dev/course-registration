package com.university.registration.domain.admin.dto;

import com.university.registration.domain.section.DayOfWeek;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminSectionCreateRequest(
    @NotNull(message = "semesterId는 필수입니다.") Long semesterId,
    @NotNull(message = "courseId는 필수입니다.") Long courseId,
    @NotBlank(message = "sectionNo는 필수입니다.") String sectionNo,
    @NotBlank(message = "professorName은 필수입니다.") String professorName,
    String classroom,
    @NotNull(message = "dayOfWeek는 필수입니다.") DayOfWeek dayOfWeek,
    @NotNull(message = "startPeriod는 필수입니다.")
        @Min(value = 1, message = "startPeriod는 1 이상이어야 합니다.")
        Integer startPeriod,
    @NotNull(message = "endPeriod는 필수입니다.")
        @Min(value = 1, message = "endPeriod는 1 이상이어야 합니다.")
        Integer endPeriod,
    @NotNull(message = "capacity는 필수입니다.")
        @Min(value = 1, message = "capacity는 1 이상이어야 합니다.")
        Integer capacity) {}
