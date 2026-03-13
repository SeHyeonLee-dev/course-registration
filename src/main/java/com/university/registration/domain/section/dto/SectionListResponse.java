package com.university.registration.domain.section.dto;

import java.util.List;

public record SectionListResponse(
    List<SectionListItemResponse> content,
    int page,
    int size,
    long totalElements,
    int totalPages) {}
