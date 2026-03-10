package com.university.registration.domain.admin.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record AdminSemesterUpdatePeriodRequest(
    @NotNull(message = "enrollStartAt는 필수입니다.") LocalDateTime enrollStartAt,
    @NotNull(message = "enrollEndAt는 필수입니다.") LocalDateTime enrollEndAt) {}
