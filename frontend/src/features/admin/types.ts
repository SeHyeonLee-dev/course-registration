export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export type AdminSemesterCreatePayload = {
  endDate: string;
  enrollEndAt: string;
  enrollStartAt: string;
  name: string;
  startDate: string;
};

export type AdminSemesterUpdatePeriodPayload = {
  enrollEndAt: string;
  enrollStartAt: string;
};

export type AdminSemesterResponse = {
  endDate: string;
  enrollEndAt: string;
  enrollStartAt: string;
  name: string;
  semesterId: number;
  startDate: string;
};

export type AdminCourseCreatePayload = {
  code: string;
  credit: number;
  department: string;
  name: string;
};

export type AdminCourseResponse = {
  code: string;
  courseId: number;
  credit: number;
  department: string | null;
  name: string;
};

export type AdminSectionCreatePayload = {
  capacity: number;
  classroom: string;
  courseId: number;
  dayOfWeek: DayOfWeek;
  endPeriod: number;
  professorName: string;
  sectionNo: string;
  semesterId: number;
  startPeriod: number;
};

export type AdminSectionResponse = {
  capacity: number;
  classroom: string | null;
  courseCode: string;
  courseId: number;
  courseName: string;
  currentCount: number;
  dayOfWeek: DayOfWeek;
  endPeriod: number;
  professorName: string;
  sectionId: number;
  sectionNo: string;
  semesterId: number;
  semesterName: string;
  startPeriod: number;
};

export type AdminSectionEnrollmentItem = {
  enrolledAt: string;
  enrollmentId: number;
  studentId: number;
  studentName: string;
  studentNumber: string;
};

export type AdminSectionEnrollmentStatusResponse = {
  capacity: number;
  courseCode: string;
  courseId: number;
  courseName: string;
  currentCount: number;
  dayOfWeek: DayOfWeek;
  endPeriod: number;
  enrollments: AdminSectionEnrollmentItem[];
  professorName: string;
  remainingCount: number;
  sectionId: number;
  sectionNo: string;
  semesterId: number;
  semesterName: string;
  startPeriod: number;
};
