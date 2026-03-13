export type TimetableItem = {
  courseCode: string;
  courseName: string;
  endPeriod: number;
  enrollmentId: number;
  professorName: string;
  sectionId: number;
  sectionNo: string;
  startPeriod: number;
};

export type MyEnrollmentItem = {
  courseCode: string;
  courseName: string;
  credit: number;
  dayOfWeek: string;
  endPeriod: number;
  enrolledAt: string;
  enrollmentId: number;
  professorName: string;
  sectionId: number;
  sectionNo: string;
  semesterId: number;
  semesterName: string;
  startPeriod: number;
};

export type MyEnrollmentResponse = {
  appliedCredit: number;
  items: MyEnrollmentItem[];
  maxCredit: number;
  remainingCredit: number;
  studentId: number;
  timetable: Record<string, TimetableItem[]>;
};
