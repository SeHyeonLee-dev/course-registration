package com.university.registration.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "학번은 필수입니다.") String studentNumber,
    @NotBlank(message = "비밀번호는 필수입니다.") String password) {}
