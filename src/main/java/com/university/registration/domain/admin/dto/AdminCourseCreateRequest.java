package com.university.registration.domain.admin.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminCourseCreateRequest(
    @NotBlank(message = "code는 필수입니다.") String code,
    @NotBlank(message = "name은 필수입니다.") String name,
    @NotNull(message = "credit은 필수입니다.") @Min(value = 1, message = "credit은 1 이상이어야 합니다.")
        Integer credit,
    String department) {}
