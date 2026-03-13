import { apiFetch } from "../../shared/api/client";
import type { MyEnrollmentResponse } from "./types";

export function getMyEnrollments(semesterId: string | null) {
  return apiFetch<MyEnrollmentResponse>(
    semesterId ? `/enrollments/my?semesterId=${semesterId}` : "/enrollments/my",
  );
}

export function cancelEnrollment(enrollmentId: number) {
  return apiFetch<void>(`/enrollments/${enrollmentId}`, {
    method: "DELETE",
  });
}
