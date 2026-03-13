import { apiFetch } from "../../shared/api/client";
import type { SemesterListResponse } from "./types";

export function getSemesters(activeOnly = false) {
  const params = new URLSearchParams();

  if (activeOnly) {
    params.set("activeOnly", "true");
  }

  const query = params.toString();
  return apiFetch<SemesterListResponse>(`/semesters${query ? `?${query}` : ""}`);
}
