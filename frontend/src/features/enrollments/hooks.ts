import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../shared/api/queryKeys";
import { cancelEnrollment, getMyEnrollments } from "./api";

export function useMyEnrollmentsQuery(semesterId: string | null) {
  return useQuery({
    queryKey: queryKeys.enrollments.mine(semesterId),
    queryFn: () => getMyEnrollments(semesterId),
  });
}

export function useCancelEnrollmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelEnrollment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      await queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });
}
