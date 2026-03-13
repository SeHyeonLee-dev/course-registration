import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../shared/api/queryKeys";
import {
  createCourse,
  createSection,
  createSemester,
  getSectionEnrollmentStatus,
  updateSemesterEnrollmentPeriod,
} from "./api";
import type { AdminSemesterUpdatePeriodPayload } from "./types";

export function useCreateSemesterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSemester,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["semesters"] });
    },
  });
}

export function useUpdateSemesterPeriodMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      semesterId,
      payload,
    }: {
      payload: AdminSemesterUpdatePeriodPayload;
      semesterId: number;
    }) => updateSemesterEnrollmentPeriod(semesterId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["semesters"] });
    },
  });
}

export function useCreateCourseMutation() {
  return useMutation({
    mutationFn: createCourse,
  });
}

export function useCreateSectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSection,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });
}

export function useAdminSectionEnrollmentStatusQuery(sectionId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.admin.sectionEnrollments(sectionId ?? "none"),
    queryFn: () => getSectionEnrollmentStatus(sectionId ?? ""),
    enabled: Boolean(sectionId),
  });
}
