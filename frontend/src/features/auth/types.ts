export type UserRole = "ROLE_STUDENT" | "ROLE_ADMIN";

export type LoginRequest = {
  password: string;
  studentNumber: string;
};

export type LoginResponse = {
  maxCredit: number;
  name: string;
  studentId: number;
  studentNumber: string;
};

export type MeResponse = {
  maxCredit: number;
  name: string;
  role: UserRole;
  studentId: number;
  studentNumber: string;
};
