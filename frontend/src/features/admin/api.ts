import { apiFetch } from "../../shared/api/client";
import type {
  AdminCourseCreatePayload,
  AdminCourseResponse,
  AdminSectionCreatePayload,
  AdminSectionEnrollmentStatusResponse,
  AdminSectionResponse,
  AdminSemesterCreatePayload,
  AdminSemesterResponse,
  AdminSemesterUpdatePeriodPayload,
} from "./types";

export function createSemester(payload: AdminSemesterCreatePayload) {
  return apiFetch<AdminSemesterResponse>("/admin/semesters", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSemesterEnrollmentPeriod(
  semesterId: number,
  payload: AdminSemesterUpdatePeriodPayload,
) {
  return apiFetch<AdminSemesterResponse>(`/admin/semesters/${semesterId}/enrollment-period`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function createCourse(payload: AdminCourseCreatePayload) {
  return apiFetch<AdminCourseResponse>("/admin/courses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createSection(payload: AdminSectionCreatePayload) {
  return apiFetch<AdminSectionResponse>("/admin/sections", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getSectionEnrollmentStatus(sectionId: string) {
  return apiFetch<AdminSectionEnrollmentStatusResponse>(`/admin/sections/${sectionId}/enrollments`);
}
