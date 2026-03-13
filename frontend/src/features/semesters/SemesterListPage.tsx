import { ErrorAlert } from "../../shared/ui/ErrorAlert";
import { Notice } from "../../shared/ui/Notice";
import { Page } from "../../shared/ui/Page";
import { useSemestersQuery } from "./hooks";
import { SemesterCard } from "./SemesterCard";

export function SemesterListPage() {
  const semestersQuery = useSemestersQuery();

  if (semestersQuery.isLoading) {
    return <Page title="Semesters">Loading semesters...</Page>;
  }

  if (semestersQuery.error) {
    return (
      <Page title="Semesters" description="Available semester list from GET /api/semesters.">
        <ErrorAlert error={semestersQuery.error} />
      </Page>
    );
  }

  const semesters = semestersQuery.data?.items ?? [];

  return (
    <Page title="Semesters" description="Available semester list from GET /api/semesters.">
      {semesters.length === 0 ? (
        <Notice title="No semesters" tone="info">
          No semester data was returned by the API.
        </Notice>
      ) : (
        <div className="stack">
          {semesters.map((semester) => (
            <SemesterCard key={semester.semesterId} semester={semester} />
          ))}
        </div>
      )}
    </Page>
  );
}
