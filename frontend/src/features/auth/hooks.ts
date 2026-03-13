import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "../../shared/api/queryKeys";
import { getMeOrNull, login, logout } from "./api";
import type { MeResponse } from "./types";

export function useMeQuery() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: getMeOrNull,
    staleTime: 60_000,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

export function useLogoutMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.setQueryData<MeResponse | null>(queryKeys.auth.me(), null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      onSuccess?.();
    },
  });
}
