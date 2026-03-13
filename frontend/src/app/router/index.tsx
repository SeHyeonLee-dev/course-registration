import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "../../features/auth/LoginPage";
import { MyEnrollmentsPage } from "../../features/enrollments/MyEnrollmentsPage";
import { SectionDetailPage } from "../../features/sections/SectionDetailPage";
import { SectionListPage } from "../../features/sections/SectionListPage";
import { SemesterListPage } from "../../features/semesters/SemesterListPage";
import { AdminGuard, AuthGuard, HomeRedirect } from "./guards";
import { RootLayout } from "../layouts/RootLayout";
import { FeaturePlaceholder } from "../../shared/ui/FeaturePlaceholder";
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
            <FeaturePlaceholder
              description="Admin forms and enrollment status screens will move into the admin branch next."
              title="Admin"
            />
          </AdminGuard>
        ),
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
