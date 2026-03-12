package com.university.registration.domain.enrollment.dto;

import jakarta.validation.constraints.NotNull;

public record EnrollmentApplyRequest(@NotNull(message = "sectionId는 필수입니다.") Long sectionId) {}
