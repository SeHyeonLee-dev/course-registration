import { useSearchParams } from "react-router-dom";
import { Card } from "../../shared/ui/Card";
import { ErrorAlert } from "../../shared/ui/ErrorAlert";
import { Field } from "../../shared/ui/Field";
import { Notice } from "../../shared/ui/Notice";
import { Page } from "../../shared/ui/Page";
import { useSemestersQuery } from "../semesters/hooks";
import { EnrollmentList } from "./EnrollmentList";
import { TimetableGrid } from "./TimetableGrid";
import { useMyEnrollmentsQuery } from "./hooks";

export function MyEnrollmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const semesterId = searchParams.get("semesterId");
  const semestersQuery = useSemestersQuery();
  const enrollmentsQuery = useMyEnrollmentsQuery(semesterId);

  const semesters = semestersQuery.data?.items ?? [];
  const enrollmentData = enrollmentsQuery.data;

  return (
    <Page
      description="Current enrollments and timetable from GET /api/enrollments/my."
      title="My Enrollments"
    >
      <Card subtitle="Optional semester filter" title="Filter">
        <Field label="Semester">
          <select
            onChange={(event) => {
              const value = event.target.value;
              const params = new URLSearchParams(searchParams);
              if (value) {
                params.set("semesterId", value);
              } else {
                params.delete("semesterId");
              }
              setSearchParams(params, { replace: true });
            }}
            value={semesterId ?? ""}
          >
            <option value="">All semesters</option>
            {semesters.map((semester) => (
              <option key={semester.semesterId} value={String(semester.semesterId)}>
                {semester.name}
              </option>
            ))}
          </select>
        </Field>
      </Card>

      {enrollmentsQuery.isLoading && (
        <Notice title="Loading" tone="info">
          Fetching enrollment data...
        </Notice>
      )}

      {enrollmentsQuery.error && <ErrorAlert error={enrollmentsQuery.error} />}

      {enrollmentData && (
        <>
          <div className="summary-grid">
            <Card title="Credit status">
              <div className="summary-metric">
                <span className="summary-metric__label">Applied</span>
                <strong>{enrollmentData.appliedCredit}</strong>
              </div>
              <div className="summary-metric">
                <span className="summary-metric__label">Remaining</span>
                <strong>{enrollmentData.remainingCredit}</strong>
              </div>
              <div className="summary-metric">
                <span className="summary-metric__label">Max</span>
                <strong>{enrollmentData.maxCredit}</strong>
              </div>
            </Card>
          </div>

          {enrollmentData.items.length === 0 ? (
            <Notice title="No enrollments" tone="info">
              You do not have any enrolled sections for the current filter.
            </Notice>
          ) : (
            <EnrollmentList items={enrollmentData.items} />
          )}

          <Card subtitle="Grouped by day of week" title="Timetable">
            <TimetableGrid timetable={enrollmentData.timetable} />
          </Card>
        </>
      )}
    </Page>
  );
}
