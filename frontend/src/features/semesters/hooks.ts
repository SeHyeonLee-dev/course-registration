import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../shared/api/queryKeys";
import { getSemesters } from "./api";

export function useSemestersQuery(activeOnly = false) {
  return useQuery({
    queryKey: queryKeys.semesters.list(activeOnly),
    queryFn: () => getSemesters(activeOnly),
  });
}
