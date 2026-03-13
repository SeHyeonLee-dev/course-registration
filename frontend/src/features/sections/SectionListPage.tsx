import { Link, useSearchParams } from "react-router-dom";
import { formatSchedule, formatSeatSummary } from "../../shared/lib/format";
import { Badge } from "../../shared/ui/Badge";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { ErrorAlert } from "../../shared/ui/ErrorAlert";
import { Notice } from "../../shared/ui/Notice";
import { Page } from "../../shared/ui/Page";
import { useSemestersQuery } from "../semesters/hooks";
import { SectionFilters } from "./SectionFilters";
import { useSectionsQuery } from "./hooks";
import type { SectionFilters as SectionFiltersValue } from "./types";

const DEFAULT_FILTERS: SectionFiltersValue = {
  dayOfWeek: "",
  keyword: "",
  page: "0",
  semesterId: "",
  size: "20",
};

export function SectionListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const semestersQuery = useSemestersQuery();

  const filters: SectionFiltersValue = {
    dayOfWeek: searchParams.get("dayOfWeek") ?? DEFAULT_FILTERS.dayOfWeek,
    keyword: searchParams.get("keyword") ?? DEFAULT_FILTERS.keyword,
    page: searchParams.get("page") ?? DEFAULT_FILTERS.page,
    semesterId: searchParams.get("semesterId") ?? DEFAULT_FILTERS.semesterId,
    size: searchParams.get("size") ?? DEFAULT_FILTERS.size,
  };

  const sectionsQuery = useSectionsQuery(filters, Boolean(filters.semesterId));

  function updateFilters(next: Partial<SectionFiltersValue>) {
    const params = new URLSearchParams(searchParams);

    (Object.keys(DEFAULT_FILTERS) as Array<keyof SectionFiltersValue>).forEach((key) => {
      const value = next[key] ?? filters[key];

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    setSearchParams(params, { replace: true });
  }

  const semesters = semestersQuery.data?.items ?? [];
  const sections = sectionsQuery.data?.content ?? [];
  const page = sectionsQuery.data?.page ?? 0;
  const totalPages = sectionsQuery.data?.totalPages ?? 0;

  return (
    <Page
      description="Search sections by semester, keyword, day of week, and pagination."
      title="Sections"
    >
      <Card subtitle="Search parameters are synced to the URL." title="Search filters">
        <SectionFilters filters={filters} onChange={updateFilters} semesters={semesters} />
      </Card>

      {!filters.semesterId && (
        <Notice title="Semester required" tone="info">
          Select a semester before loading sections. The backend requires `semesterId`.
        </Notice>
      )}

      {sectionsQuery.error && <ErrorAlert error={sectionsQuery.error} />}

      {filters.semesterId && sectionsQuery.isLoading && (
        <Notice title="Loading" tone="info">
          Fetching sections...
        </Notice>
      )}

      {filters.semesterId && !sectionsQuery.isLoading && sections.length === 0 && (
        <Notice title="No results" tone="info">
          No sections matched the current filters.
        </Notice>
      )}

      <div className="stack">
        {sections.map((section) => (
          <Card
            key={section.sectionId}
            subtitle={`${section.courseCode} • ${section.semesterName}`}
            title={`${section.courseName} - ${section.sectionNo}`}
          >
            <div className="badge-row">
              <Badge tone="primary">
                {formatSchedule(section.dayOfWeek, section.startPeriod, section.endPeriod)}
              </Badge>
              <Badge>{formatSeatSummary(section.remainingCount, section.capacity)}</Badge>
              <Badge>{section.professorName}</Badge>
            </div>

            <div className="detail-list detail-list--two-columns">
              <div>
                <span className="detail-list__label">Classroom</span>
                <span>{section.classroom ?? "Not set"}</span>
              </div>
              <div>
                <span className="detail-list__label">Department</span>
                <span>{section.department ?? "Not set"}</span>
              </div>
              <div>
                <span className="detail-list__label">Credit</span>
                <span>{section.credit}</span>
              </div>
              <div>
                <span className="detail-list__label">Current count</span>
                <span>{section.currentCount}</span>
              </div>
            </div>

            <div className="button-row">
              <Button asChild size="sm" variant="secondary">
                <Link to={`/sections/${section.sectionId}`}>View detail</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <Button
            disabled={page <= 0}
            onClick={() => updateFilters({ page: String(page - 1) })}
            size="sm"
            type="button"
            variant="secondary"
          >
            Previous
          </Button>
          <span className="pagination__status">
            Page {page + 1} / {totalPages}
          </span>
          <Button
            disabled={page + 1 >= totalPages}
            onClick={() => updateFilters({ page: String(page + 1) })}
            size="sm"
            type="button"
            variant="secondary"
          >
            Next
          </Button>
        </div>
      )}
    </Page>
  );
}
