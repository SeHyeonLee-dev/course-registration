export type SemesterItem = {
  endDate: string;
  enrollEndAt: string;
  enrollStartAt: string;
  name: string;
  semesterId: number;
  startDate: string;
};

export type SemesterListResponse = {
  items: SemesterItem[];
};
