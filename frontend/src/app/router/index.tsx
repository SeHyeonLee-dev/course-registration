import { createBrowserRouter } from "react-router-dom";
import { AdminLayout } from "../layouts/AdminLayout";
import { AdminCoursePage } from "../../features/admin/AdminCoursePage";
import { AdminDashboardPage } from "../../features/admin/AdminDashboardPage";
import { AdminSectionEnrollmentStatusPage } from "../../features/admin/AdminSectionEnrollmentStatusPage";
import { AdminSectionPage } from "../../features/admin/AdminSectionPage";
import { AdminSemesterPage } from "../../features/admin/AdminSemesterPage";
import { LoginPage } from "../../features/auth/LoginPage";
import { MyEnrollmentsPage } from "../../features/enrollments/MyEnrollmentsPage";
import { SectionDetailPage } from "../../features/sections/SectionDetailPage";
import { SectionListPage } from "../../features/sections/SectionListPage";
import { SemesterListPage } from "../../features/semesters/SemesterListPage";
import { AdminGuard, AuthGuard, HomeRedirect } from "./guards";
import { RootLayout } from "../layouts/RootLayout";
import { Page } from "../../shared/ui/Page";

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
            <SemesterListPage />
          </AuthGuard>
        ),
      },
      {
        path: "sections",
        element: (
          <AuthGuard>
            <SectionListPage />
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
            <AdminLayout />
          </AdminGuard>
        ),
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "semesters/new", element: <AdminSemesterPage /> },
          { path: "courses/new", element: <AdminCoursePage /> },
          { path: "sections/new", element: <AdminSectionPage /> },
          { path: "sections/enrollments", element: <AdminSectionEnrollmentStatusPage /> },
          { path: "sections/:sectionId/enrollments", element: <AdminSectionEnrollmentStatusPage /> },
        ],
      },
      {
        path: "403",
        element: (
          <Page title="403" description="Only admin users can access this route.">
            Permission denied.
          </Page>
        ),
      },
      {
        path: "*",
        element: (
          <Page title="404" description="The route could not be found.">
            Route not found.
          </Page>
        ),
      },
    ],
  },
]);
