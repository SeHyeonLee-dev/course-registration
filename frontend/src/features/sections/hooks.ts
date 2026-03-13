import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../shared/api/queryKeys";
import { applyEnrollment, getSectionDetail, getSections } from "./api";
import type { SectionFilters } from "./types";

export function useSectionsQuery(filters: SectionFilters, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.sections.list(filters),
    queryFn: () => getSections(filters),
    enabled,
    placeholderData: (previousData) => previousData,
  });
}

export function useSectionDetailQuery(sectionId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.sections.detail(sectionId ?? "unknown"),
    queryFn: () => getSectionDetail(sectionId ?? ""),
    enabled: Boolean(sectionId),
  });
}

export function useApplyEnrollmentMutation(sectionId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => applyEnrollment(Number(sectionId)),
    onSuccess: async () => {
      if (sectionId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.sections.detail(sectionId),
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["sections"] });
      await queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}
