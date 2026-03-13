export type SectionFilters = {
  dayOfWeek: string;
  keyword: string;
  page: string;
  semesterId: string;
  size: string;
};

export type SectionListItem = {
  capacity: number;
  classroom: string | null;
  courseCode: string;
  courseId: number;
  courseName: string;
  credit: number;
  currentCount: number;
  dayOfWeek: string;
  department: string | null;
  endPeriod: number;
  professorName: string;
  remainingCount: number;
  sectionId: number;
  sectionNo: string;
  semesterId: number;
  semesterName: string;
  startPeriod: number;
};

export type SectionListResponse = {
  content: SectionListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type SectionDetailResponse = {
  capacity: number;
  classroom: string | null;
  course: {
    code: string;
    courseId: number;
    credit: number;
    department: string | null;
    name: string;
  };
  currentCount: number;
  dayOfWeek: string;
  endPeriod: number;
  professorName: string;
  remainingCount: number;
  sectionId: number;
  sectionNo: string;
  semesterId: number;
  semesterName: string;
  startPeriod: number;
};
