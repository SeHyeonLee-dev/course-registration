import type { CSSProperties, FormEvent, ReactElement, ReactNode } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  Link,
  Navigate,
  Outlet,
  createBrowserRouter,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { ApiError, apiFetch } from "../shared/api/client";

type MeResponse = {
  studentId: number;
  studentNumber: string;
  name: string;
  role: "ROLE_STUDENT" | "ROLE_ADMIN";
  maxCredit: number;
};

type LoginRequest = {
  studentNumber: string;
  password: string;
};

type SemesterItem = {
  semesterId: number;
  name: string;
  startDate: string;
  endDate: string;
  enrollStartAt: string;
  enrollEndAt: string;
};

type SemesterListResponse = {
  items: SemesterItem[];
};

type SectionListItem = {
  sectionId: number;
  semesterId: number;
  semesterName: string;
  courseId: number;
  courseCode: string;
  courseName: string;
  credit: number;
  department: string | null;
  sectionNo: string;
  professorName: string;
  classroom: string | null;
  dayOfWeek: string;
  startPeriod: number;
  endPeriod: number;
  capacity: number;
  currentCount: number;
  remainingCount: number;
};

type SectionListResponse = {
  content: SectionListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

type SectionDetailResponse = {
  sectionId: number;
  semesterId: number;
  semesterName: string;
  sectionNo: string;
  professorName: string;
  classroom: string | null;
  dayOfWeek: string;
  startPeriod: number;
  endPeriod: number;
  capacity: number;
  currentCount: number;
  remainingCount: number;
  course: {
    courseId: number;
    code: string;
    name: string;
    credit: number;
    department: string | null;
  };
};

type MyEnrollmentItem = {
  enrollmentId: number;
  sectionId: number;
  semesterId: number;
  semesterName: string;
  courseCode: string;
  courseName: string;
  credit: number;
  sectionNo: string;
  professorName: string;
  dayOfWeek: string;
  startPeriod: number;
  endPeriod: number;
  enrolledAt: string;
};

type MyEnrollmentResponse = {
  studentId: number;
  maxCredit: number;
  appliedCredit: number;
  remainingCredit: number;
  items: MyEnrollmentItem[];
  timetable: Record<string, MyEnrollmentItem[]>;
};

async function getMeOrNull() {
  try {
    return await apiFetch<MeResponse>("/auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

async function login(body: LoginRequest) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function logout() {
  return apiFetch<void>("/auth/logout", {
    method: "POST",
  });
}

function useMeQuery(): UseQueryResult<MeResponse | null, Error> {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMeOrNull,
    staleTime: 60_000,
  });
}

function AuthGuard({ children }: { children: ReactElement }) {
  const meQuery = useMeQuery();

  if (meQuery.isLoading) {
    return <Page title="Loading">Checking session...</Page>;
  }

  if (!meQuery.data) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminGuard({ children }: { children: ReactElement }) {
  const meQuery = useMeQuery();

  if (meQuery.isLoading) {
    return <Page title="Loading">Checking permissions...</Page>;
  }

  if (!meQuery.data) {
    return <Navigate to="/login" replace />;
  }

  if (meQuery.data.role !== "ROLE_ADMIN") {
    return <Navigate to="/403" replace />;
  }

  return children;
}

function RootLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const meQuery = useMeQuery();
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      navigate("/login", { replace: true });
    },
  });

  const user = meQuery.data;

  return (
    <div style={styles.shell}>
      <header style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Registration Frontend</div>
          <h1 style={styles.title}>Student course registration client</h1>
        </div>
        <nav style={styles.nav}>
          <Link to="/semesters">Semesters</Link>
          <Link to="/sections">Sections</Link>
          <Link to="/my-enrollments">My Enrollments</Link>
          {user?.role === "ROLE_ADMIN" && <Link to="/admin">Admin</Link>}
          {user ? (
            <button onClick={() => logoutMutation.mutate()} type="button">
              Logout ({user.name})
            </button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </header>
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

function HomeRedirect() {
  const meQuery = useMeQuery();

  if (meQuery.isLoading) {
    return <Page title="Loading">Checking session...</Page>;
  }

  return <Navigate to={meQuery.data ? "/semesters" : "/login"} replace />;
}

function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const meQuery = useMeQuery();
  const loginMutation = useMutation({
    mutationFn: login,
  });

  if (meQuery.data) {
    return <Navigate to="/semesters" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    await loginMutation.mutateAsync({
      studentNumber: String(formData.get("studentNumber") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    const me = await queryClient.fetchQuery({
      queryKey: ["auth", "me"],
      queryFn: getMeOrNull,
    });

    if (me?.role === "ROLE_ADMIN") {
      navigate("/admin", { replace: true });
      return;
    }

    navigate("/semesters", { replace: true });
  }

  return (
    <Page title="Login" description="POST /api/auth/login + GET /api/auth/me 기반 세션 로그인">
      <form onSubmit={handleSubmit} style={styles.card}>
        <label style={styles.field}>
          Student number
          <input defaultValue="20230001" name="studentNumber" required type="text" />
        </label>
        <label style={styles.field}>
          Password
          <input defaultValue="password123" name="password" required type="password" />
        </label>
        {loginMutation.error instanceof ApiError && (
          <ErrorMessage error={loginMutation.error} />
        )}
        <button disabled={loginMutation.isPending} type="submit">
          {loginMutation.isPending ? "Signing in..." : "Login"}
        </button>
      </form>
    </Page>
  );
}

function SemestersPage() {
  const semesterQuery = useQuery({
    queryKey: ["semesters"],
    queryFn: () => apiFetch<SemesterListResponse>("/semesters"),
  });

  if (semesterQuery.isLoading) {
    return <Page title="Semesters">Loading semesters...</Page>;
  }

  if (semesterQuery.error) {
    return (
      <Page title="Semesters">
        <ErrorMessage error={semesterQuery.error} />
      </Page>
    );
  }

  const semesters = semesterQuery.data?.items ?? [];

  return (
    <Page title="Semesters" description="GET /api/semesters">
      <div style={styles.stack}>
        {semesters.map((semester) => (
          <article key={semester.semesterId} style={styles.card}>
            <strong>{semester.name}</strong>
            <span>
              {semester.startDate} - {semester.endDate}
            </span>
            <span>
              Enrollment: {semester.enrollStartAt} - {semester.enrollEndAt}
            </span>
            <div style={styles.row}>
              <Link to={`/sections?semesterId=${semester.semesterId}`}>Browse sections</Link>
              <Link to={`/my-enrollments?semesterId=${semester.semesterId}`}>My enrollments</Link>
            </div>
          </article>
        ))}
      </div>
    </Page>
  );
}

function SectionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const semesterId = searchParams.get("semesterId") ?? "";
  const keyword = searchParams.get("keyword") ?? "";
  const dayOfWeek = searchParams.get("dayOfWeek") ?? "";
  const page = searchParams.get("page") ?? "0";
  const size = searchParams.get("size") ?? "20";

  const sectionsQuery = useQuery({
    queryKey: ["sections", semesterId, keyword, dayOfWeek, page, size],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set("semesterId", semesterId);

      if (keyword) {
        params.set("keyword", keyword);
      }
      if (dayOfWeek) {
        params.set("dayOfWeek", dayOfWeek);
      }

      params.set("page", page);
      params.set("size", size);

      return apiFetch<SectionListResponse>(`/sections?${params.toString()}`);
    },
    enabled: Boolean(semesterId),
  });

  function updateSearch(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams);

    Object.entries(next).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    if (!params.get("page")) {
      params.set("page", "0");
    }
    if (!params.get("size")) {
      params.set("size", "20");
    }

    setSearchParams(params, { replace: true });
  }

  return (
    <Page title="Sections" description="GET /api/sections">
      <div style={styles.card}>
        <div style={styles.filters}>
          <label style={styles.field}>
            Semester ID
            <input
              onChange={(event) => updateSearch({ semesterId: event.target.value, page: "0" })}
              type="number"
              value={semesterId}
            />
          </label>
          <label style={styles.field}>
            Keyword
            <input
              onChange={(event) => updateSearch({ keyword: event.target.value, page: "0" })}
              type="text"
              value={keyword}
            />
          </label>
          <label style={styles.field}>
            Day
            <select
              onChange={(event) => updateSearch({ dayOfWeek: event.target.value, page: "0" })}
              value={dayOfWeek}
            >
              <option value="">All</option>
              <option value="MON">MON</option>
              <option value="TUE">TUE</option>
              <option value="WED">WED</option>
              <option value="THU">THU</option>
              <option value="FRI">FRI</option>
            </select>
          </label>
        </div>
      </div>

      {!semesterId && <p>Set a semester ID first. The backend requires it.</p>}

      {sectionsQuery.isFetching && semesterId && <p>Loading sections...</p>}
      {sectionsQuery.error && <ErrorMessage error={sectionsQuery.error} />}

      <div style={styles.stack}>
        {sectionsQuery.data?.content.map((section) => (
          <article key={section.sectionId} style={styles.card}>
            <strong>
              {section.courseCode} {section.courseName} - {section.sectionNo}
            </strong>
            <span>
              {section.dayOfWeek} {section.startPeriod}-{section.endPeriod}
            </span>
            <span>
              {section.professorName} / Remaining {section.remainingCount} / {section.capacity}
            </span>
            <div style={styles.row}>
              <Link to={`/sections/${section.sectionId}`}>Details</Link>
            </div>
          </article>
        ))}
      </div>
    </Page>
  );
}

function SectionDetailPage() {
  const { sectionId } = useParams();
  const queryClient = useQueryClient();
  const sectionQuery = useQuery({
    queryKey: ["section", sectionId],
    queryFn: () => apiFetch<SectionDetailResponse>(`/sections/${sectionId}`),
    enabled: Boolean(sectionId),
  });
  const applyMutation = useMutation({
    mutationFn: () =>
      apiFetch("/enrollments", {
        method: "POST",
        body: JSON.stringify({ sectionId: Number(sectionId) }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["section", sectionId] });
      await queryClient.invalidateQueries({ queryKey: ["sections"] });
      await queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
    },
  });

  if (sectionQuery.isLoading) {
    return <Page title="Section">Loading section...</Page>;
  }

  if (sectionQuery.error) {
    return (
      <Page title="Section">
        <ErrorMessage error={sectionQuery.error} />
      </Page>
    );
  }

  const section = sectionQuery.data;

  if (!section) {
    return <Page title="Section">Section data was not returned.</Page>;
  }

  return (
    <Page title="Section Detail" description={`GET /api/sections/${sectionId}`}>
      <article style={styles.card}>
        <strong>
          {section.course.code} {section.course.name}
        </strong>
        <span>Section {section.sectionNo}</span>
        <span>Professor: {section.professorName}</span>
        <span>
          Schedule: {section.dayOfWeek} {section.startPeriod}-{section.endPeriod}
        </span>
        <span>
          Seats: {section.remainingCount} remaining / {section.capacity}
        </span>
        {applyMutation.error && <ErrorMessage error={applyMutation.error} />}
        <button disabled={applyMutation.isPending} onClick={() => applyMutation.mutate()} type="button">
          {applyMutation.isPending ? "Applying..." : "Apply Enrollment"}
        </button>
      </article>
    </Page>
  );
}

function MyEnrollmentsPage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const semesterId = searchParams.get("semesterId");

  const enrollmentQuery = useQuery({
    queryKey: ["my-enrollments", semesterId ?? "all"],
    queryFn: () =>
      apiFetch<MyEnrollmentResponse>(
        semesterId ? `/enrollments/my?semesterId=${semesterId}` : "/enrollments/my",
      ),
  });

  const cancelMutation = useMutation({
    mutationFn: (enrollmentId: number) =>
      apiFetch<void>(`/enrollments/${enrollmentId}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
      await queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });

  if (enrollmentQuery.isLoading) {
    return <Page title="My Enrollments">Loading enrollments...</Page>;
  }

  if (enrollmentQuery.error) {
    return (
      <Page title="My Enrollments">
        <ErrorMessage error={enrollmentQuery.error} />
      </Page>
    );
  }

  const enrollmentData = enrollmentQuery.data;

  if (!enrollmentData) {
    return <Page title="My Enrollments">Enrollment data was not returned.</Page>;
  }

  return (
    <Page title="My Enrollments" description="GET /api/enrollments/my">
      <div style={styles.card}>
        <strong>Credit Summary</strong>
        <span>Applied: {enrollmentData.appliedCredit}</span>
        <span>Remaining: {enrollmentData.remainingCredit}</span>
      </div>

      <div style={styles.stack}>
        {enrollmentData.items.map((item) => (
          <article key={item.enrollmentId} style={styles.card}>
            <strong>
              {item.courseCode} {item.courseName}
            </strong>
            <span>
              {item.dayOfWeek} {item.startPeriod}-{item.endPeriod}
            </span>
            <span>{item.professorName}</span>
            <button
              disabled={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate(item.enrollmentId)}
              type="button"
            >
              Cancel
            </button>
          </article>
        ))}
      </div>
    </Page>
  );
}

function AdminPage() {
  return (
    <Page title="Admin" description="초기 스켈레톤. 다음 단계에서 생성/수정 폼을 기능별로 분리합니다.">
      <div style={styles.stack}>
        <article style={styles.card}>
          <strong>Available admin endpoints</strong>
          <span>POST /api/admin/semesters</span>
          <span>PUT /api/admin/semesters/:semesterId/enrollment-period</span>
          <span>POST /api/admin/courses</span>
          <span>POST /api/admin/sections</span>
          <span>GET /api/admin/sections/:sectionId/enrollments</span>
        </article>
      </div>
    </Page>
  );
}

function ForbiddenPage() {
  return <Page title="403">Admin role required.</Page>;
}

function NotFoundPage() {
  return <Page title="404">Route not found.</Page>;
}

function ErrorMessage({ error }: { error: unknown }) {
  if (error instanceof ApiError) {
    return (
      <div style={styles.errorBox}>
        <strong>{error.code ?? "API error"}</strong>
        <div>{error.message}</div>
      </div>
    );
  }

  return (
    <div style={styles.errorBox}>
      <strong>Unexpected error</strong>
      <div>{error instanceof Error ? error.message : "Unknown error"}</div>
    </div>
  );
}

function Page({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section style={styles.page}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>{title}</h2>
        {description && <p style={styles.pageDescription}>{description}</p>}
      </div>
      <div style={styles.stack}>{children}</div>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  shell: {
    minHeight: "100vh",
    background: "#f6f8fb",
    color: "#17212b",
    fontFamily:
      "\"Segoe UI\", \"Apple SD Gothic Neo\", \"Noto Sans KR\", sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    padding: "1.5rem 2rem",
    borderBottom: "1px solid #d8dee8",
    background: "#ffffff",
  },
  eyebrow: {
    fontSize: "0.8rem",
    color: "#576579",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  title: {
    margin: "0.3rem 0 0",
    fontSize: "1.5rem",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "0.9rem",
  },
  main: {
    maxWidth: "1080px",
    margin: "0 auto",
    padding: "2rem",
  },
  page: {
    display: "grid",
    gap: "1.25rem",
  },
  pageHeader: {
    display: "grid",
    gap: "0.35rem",
  },
  pageTitle: {
    margin: 0,
    fontSize: "1.4rem",
  },
  pageDescription: {
    margin: 0,
    color: "#576579",
  },
  stack: {
    display: "grid",
    gap: "1rem",
  },
  row: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
  card: {
    display: "grid",
    gap: "0.55rem",
    padding: "1rem",
    background: "#ffffff",
    border: "1px solid #d8dee8",
    borderRadius: "14px",
  },
  field: {
    display: "grid",
    gap: "0.35rem",
  },
  filters: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "0.75rem",
  },
  errorBox: {
    padding: "0.8rem 1rem",
    background: "#fff1f1",
    color: "#7a1f1f",
    border: "1px solid #efc3c3",
    borderRadius: "12px",
  },
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomeRedirect /> },
      { path: "login", element: <LoginPage /> },
      {
        path: "semesters",
        element: (
          <AuthGuard>
            <SemestersPage />
          </AuthGuard>
        ),
      },
      {
        path: "sections",
        element: (
          <AuthGuard>
            <SectionsPage />
          </AuthGuard>
        ),
      },
      {
        path: "sections/:sectionId",
        element: (
          <AuthGuard>
            <SectionDetailPage />
          </AuthGuard>
        ),
      },
      {
        path: "my-enrollments",
        element: (
          <AuthGuard>
            <MyEnrollmentsPage />
          </AuthGuard>
        ),
      },
      {
        path: "admin",
        element: (
          <AdminGuard>
            <AdminPage />
          </AdminGuard>
        ),
      },
      { path: "403", element: <ForbiddenPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
