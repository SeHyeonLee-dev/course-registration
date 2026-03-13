import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "../../features/auth/LoginPage";
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
            <FeaturePlaceholder
              description="Semester listing will move into its own feature module next."
              title="Semesters"
            />
          </AuthGuard>
        ),
      },
      {
        path: "sections",
        element: (
          <AuthGuard>
            <FeaturePlaceholder
              description="Section search and filters will move into the student-flow branch next."
              title="Sections"
            />
          </AuthGuard>
        ),
      },
      {
        path: "sections/:sectionId",
        element: (
          <AuthGuard>
            <FeaturePlaceholder
              description="Section detail and apply actions will move into the student-flow branch next."
              title="Section Detail"
            />
          </AuthGuard>
        ),
      },
      {
        path: "my-enrollments",
        element: (
          <AuthGuard>
            <FeaturePlaceholder
              description="Enrollment list and timetable will move into the student-flow branch next."
              title="My Enrollments"
            />
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
