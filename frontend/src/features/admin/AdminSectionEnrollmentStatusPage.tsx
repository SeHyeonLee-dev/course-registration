import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { formatDateTime, formatSchedule, formatSeatSummary } from "../../shared/lib/format";
import { Badge } from "../../shared/ui/Badge";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { ErrorAlert } from "../../shared/ui/ErrorAlert";
import { Field } from "../../shared/ui/Field";
import { Notice } from "../../shared/ui/Notice";
import { Page } from "../../shared/ui/Page";
import { useSectionsQuery } from "../sections/hooks";
import { SectionFilters } from "../sections/SectionFilters";
import type { SectionFilters as SectionFiltersValue } from "../sections/types";
import { useSemestersQuery } from "../semesters/hooks";
import { useAdminSectionEnrollmentStatusQuery } from "./hooks";

const DEFAULT_FILTERS: SectionFiltersValue = {
  dayOfWeek: "",
  keyword: "",
  page: "0",
  semesterId: "",
  size: "20",
};

export function AdminSectionEnrollmentStatusPage() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const semestersQuery = useSemestersQuery();
  const statusQuery = useAdminSectionEnrollmentStatusQuery(sectionId);

  const filters: SectionFiltersValue = {
    dayOfWeek: searchParams.get("dayOfWeek") ?? DEFAULT_FILTERS.dayOfWeek,
    keyword: searchParams.get("keyword") ?? DEFAULT_FILTERS.keyword,
    page: searchParams.get("page") ?? DEFAULT_FILTERS.page,
    semesterId: searchParams.get("semesterId") ?? DEFAULT_FILTERS.semesterId,
    size: searchParams.get("size") ?? DEFAULT_FILTERS.size,
  };

  const sectionsQuery = useSectionsQuery(filters, Boolean(filters.semesterId));
  const semesters = semestersQuery.data?.items ?? [];
  const sections = sectionsQuery.data?.content ?? [];
  const page = sectionsQuery.data?.page ?? 0;
  const status = statusQuery.data;
  const totalPages = sectionsQuery.data?.totalPages ?? 0;

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

  function selectSection(nextSectionId: number) {
    const query = searchParams.toString();
    navigate(`/admin/sections/${nextSectionId}/enrollments${query ? `?${query}` : ""}`);
  }

  return (
    <Page
      description="Search sections and inspect enrollment status with admin-only APIs."
      title="Admin / Enrollment Status"
    >
      <Card subtitle="Use the standard section list filters, then pick a section." title="Section lookup">
        <SectionFilters filters={filters} onChange={updateFilters} semesters={semesters} />
      </Card>

      {!filters.semesterId && (
        <Notice title="Semester required" tone="info">
          Select a semester before loading section candidates.
        </Notice>
      )}

      {semestersQuery.error && <ErrorAlert error={semestersQuery.error} />}
      {sectionsQuery.error && <ErrorAlert error={sectionsQuery.error} />}

      {filters.semesterId && sectionsQuery.isLoading && (
        <Notice title="Loading" tone="info">
          Fetching sections for lookup...
        </Notice>
      )}

      {filters.semesterId && !sectionsQuery.isLoading && sections.length === 0 && (
        <Notice title="No section results" tone="info">
          No sections matched the current lookup filters.
        </Notice>
      )}

      <div className="stack">
        {sections.map((section) => (
          <Card
            key={section.sectionId}
            subtitle={`${section.courseCode} / ${section.semesterName}`}
            title={`${section.courseName} - ${section.sectionNo}`}
          >
            <div className="badge-row">
              <Badge tone="primary">
                {formatSchedule(section.dayOfWeek, section.startPeriod, section.endPeriod)}
              </Badge>
              <Badge>{formatSeatSummary(section.remainingCount, section.capacity)}</Badge>
              <Badge>Section ID #{section.sectionId}</Badge>
            </div>

            <div className="button-row">
              <Button
                onClick={() => selectSection(section.sectionId)}
                size="sm"
                type="button"
                variant={String(section.sectionId) === sectionId ? "primary" : "secondary"}
              >
                {String(section.sectionId) === sectionId ? "Selected" : "View enrollment status"}
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link to={`/sections/${section.sectionId}`}>Open section detail</Link>
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

      {!sectionId && (
        <Notice title="Section not selected" tone="info">
          Pick a section from the lookup results to load enrollment status.
        </Notice>
      )}

      {statusQuery.error && <ErrorAlert error={statusQuery.error} />}

      {statusQuery.isLoading && sectionId && (
        <Notice title="Loading" tone="info">
          Fetching enrollment status...
        </Notice>
      )}

      {status && (
        <>
          <Card
            subtitle={`${status.courseCode} / ${status.semesterName} / Section ${status.sectionNo}`}
            title="Section status"
          >
            <div className="badge-row">
              <Badge tone="primary">
                {formatSchedule(status.dayOfWeek, status.startPeriod, status.endPeriod)}
              </Badge>
              <Badge>{formatSeatSummary(status.remainingCount, status.capacity)}</Badge>
              <Badge>{status.professorName}</Badge>
            </div>

            <div className="detail-list detail-list--two-columns">
              <div>
                <span className="detail-list__label">Section ID</span>
                <span>{status.sectionId}</span>
              </div>
              <div>
                <span className="detail-list__label">Current count</span>
                <span>{status.currentCount}</span>
              </div>
              <div>
                <span className="detail-list__label">Remaining count</span>
                <span>{status.remainingCount}</span>
              </div>
              <div>
                <span className="detail-list__label">Capacity</span>
                <span>{status.capacity}</span>
              </div>
            </div>
          </Card>

          <Card subtitle="Ordered by enrolledAt desc" title="Enrollment records">
            {status.enrollments.length === 0 ? (
              <Notice title="No enrollments" tone="info">
                No students are currently enrolled in this section.
              </Notice>
            ) : (
              <div className="stack">
                {status.enrollments.map((enrollment) => (
                  <Card
                    key={enrollment.enrollmentId}
                    subtitle={`Student #${enrollment.studentNumber}`}
                    title={enrollment.studentName}
                  >
                    <div className="detail-list detail-list--two-columns">
                      <div>
                        <span className="detail-list__label">Enrollment ID</span>
                        <span>{enrollment.enrollmentId}</span>
                      </div>
                      <div>
                        <span className="detail-list__label">Student ID</span>
                        <span>{enrollment.studentId}</span>
                      </div>
                      <div>
                        <span className="detail-list__label">Submitted at</span>
                        <span>{formatDateTime(enrollment.enrolledAt)}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      <Card subtitle="Direct navigation without search results" title="Jump to a section ID">
        <SectionIdJumpForm sectionId={sectionId} />
      </Card>
    </Page>
  );
}

function SectionIdJumpForm({ sectionId }: { sectionId: string | undefined }) {
  const navigate = useNavigate();
  const [value, setValue] = useState(sectionId ?? "");

  useEffect(() => {
    setValue(sectionId ?? "");
  }, [sectionId]);

  return (
    <form
      className="inline-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!value) {
          return;
        }

        navigate(`/admin/sections/${value}/enrollments`);
      }}
    >
      <Field htmlFor="section-id-jump" label="Section ID">
        <input
          id="section-id-jump"
          min="1"
          onChange={(event) => setValue(event.target.value)}
          placeholder="Enter section ID"
          required
          type="number"
          value={value}
        />
      </Field>

      <div className="button-row">
        <Button type="submit" variant="secondary">
          Load section
        </Button>
      </div>
    </form>
  );
}
