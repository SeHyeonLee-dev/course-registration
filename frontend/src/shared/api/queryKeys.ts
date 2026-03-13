export const queryKeys = {
  auth: {
    me: () => ["auth", "me"] as const,
  },
  semesters: {
    list: (activeOnly?: boolean) => ["semesters", { activeOnly: activeOnly ?? false }] as const,
  },
  sections: {
    list: (filters: Record<string, string>) => ["sections", filters] as const,
    detail: (sectionId: string | number) => ["sections", "detail", sectionId] as const,
  },
  enrollments: {
    mine: (semesterId: string | null) => ["enrollments", "mine", semesterId ?? "all"] as const,
  },
  admin: {
    sectionEnrollments: (sectionId: string | number) =>
      ["admin", "section-enrollments", sectionId] as const,
  },
};
