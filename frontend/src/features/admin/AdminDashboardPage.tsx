import { Link } from "react-router-dom";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { Notice } from "../../shared/ui/Notice";
import { Page } from "../../shared/ui/Page";

export function AdminDashboardPage() {
  return (
    <Page
      description="Admin-only operations backed by /api/admin endpoints in the current repo."
      title="Admin"
    >
      <Notice title="Repo constraint" tone="info">
        A course list lookup API was not found in the repo. Create a course first, then reuse the
        returned course ID when creating a section.
      </Notice>

      <div className="summary-grid">
        <Card title="Semesters" subtitle="POST /api/admin/semesters and PUT enrollment period">
          <p>Create a new semester and adjust enrollment windows for an existing semester.</p>
          <div className="button-row">
            <Button asChild size="sm" variant="secondary">
              <Link to="/admin/semesters/new">Manage semesters</Link>
            </Button>
          </div>
        </Card>

        <Card title="Courses" subtitle="POST /api/admin/courses">
          <p>Create a course and capture the returned course ID for later section creation.</p>
          <div className="button-row">
            <Button asChild size="sm" variant="secondary">
              <Link to="/admin/courses/new">Create course</Link>
            </Button>
          </div>
        </Card>

        <Card title="Sections" subtitle="POST /api/admin/sections">
          <p>Create a section by combining a semester ID, course ID, schedule, and capacity.</p>
          <div className="button-row">
            <Button asChild size="sm" variant="secondary">
              <Link to="/admin/sections/new">Create section</Link>
            </Button>
          </div>
        </Card>

        <Card title="Enrollment Status" subtitle="GET /api/admin/sections/{sectionId}/enrollments">
          <p>Search sections and inspect enrolled students, remaining seats, and submission times.</p>
          <div className="button-row">
            <Button asChild size="sm" variant="secondary">
              <Link to="/admin/sections/enrollments">View status</Link>
            </Button>
          </div>
        </Card>
      </div>
    </Page>
  );
}
