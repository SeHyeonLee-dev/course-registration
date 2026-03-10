package com.university.registration.domain.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AdminSemesterCreateRequest(
    @NotBlank(message = "name은 필수입니다.") String name,
    @NotNull(message = "startDate는 필수입니다.") LocalDate startDate,
    @NotNull(message = "endDate는 필수입니다.") LocalDate endDate,
    @NotNull(message = "enrollStartAt는 필수입니다.") LocalDateTime enrollStartAt,
    @NotNull(message = "enrollEndAt는 필수입니다.") LocalDateTime enrollEndAt) {}
