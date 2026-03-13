import { apiFetch } from "../../shared/api/client";
import type { SectionDetailResponse, SectionFilters, SectionListResponse } from "./types";

export function getSections(filters: SectionFilters) {
  const params = new URLSearchParams();
  params.set("semesterId", filters.semesterId);
  params.set("page", filters.page);
  params.set("size", filters.size);

  if (filters.keyword) {
    params.set("keyword", filters.keyword);
  }

  if (filters.dayOfWeek) {
    params.set("dayOfWeek", filters.dayOfWeek);
  }

  return apiFetch<SectionListResponse>(`/sections?${params.toString()}`);
}

export function getSectionDetail(sectionId: string) {
  return apiFetch<SectionDetailResponse>(`/sections/${sectionId}`);
}

export function applyEnrollment(sectionId: number) {
  return apiFetch("/enrollments", {
    method: "POST",
    body: JSON.stringify({ sectionId }),
  });
}
