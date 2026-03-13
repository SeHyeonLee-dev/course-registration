import { Link, useParams } from "react-router-dom";
import { formatSchedule, formatSeatSummary } from "../../shared/lib/format";
import { Badge } from "../../shared/ui/Badge";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { ErrorAlert } from "../../shared/ui/ErrorAlert";
import { Notice } from "../../shared/ui/Notice";
import { Page } from "../../shared/ui/Page";
import { useApplyEnrollmentMutation, useSectionDetailQuery } from "./hooks";

export function SectionDetailPage() {
  const { sectionId } = useParams();
  const sectionQuery = useSectionDetailQuery(sectionId);
  const applyMutation = useApplyEnrollmentMutation(sectionId);

  if (sectionQuery.isLoading) {
    return <Page title="Section Detail">Loading section detail...</Page>;
  }

  if (sectionQuery.error) {
    return (
      <Page title="Section Detail">
        <ErrorAlert error={sectionQuery.error} />
      </Page>
    );
  }

  const section = sectionQuery.data;

  if (!section) {
    return (
      <Page title="Section Detail">
        <Notice title="Missing section" tone="info">
          Section data was not returned by the API.
        </Notice>
      </Page>
    );
  }

  return (
    <Page
      actions={
        <Button asChild size="sm" variant="ghost">
          <Link to={`/sections?semesterId=${section.semesterId}`}>Back to list</Link>
        </Button>
      }
      description={`Section detail from GET /api/sections/${sectionId}`}
      title={`${section.course.code} ${section.course.name}`}
    >
      <Card subtitle={`${section.semesterName} • Section ${section.sectionNo}`} title="Overview">
        <div className="badge-row">
          <Badge tone="primary">
            {formatSchedule(section.dayOfWeek, section.startPeriod, section.endPeriod)}
          </Badge>
          <Badge>{formatSeatSummary(section.remainingCount, section.capacity)}</Badge>
          <Badge>{section.professorName}</Badge>
        </div>

        <div className="detail-list detail-list--two-columns">
          <div>
            <span className="detail-list__label">Course code</span>
            <span>{section.course.code}</span>
          </div>
          <div>
            <span className="detail-list__label">Credit</span>
            <span>{section.course.credit}</span>
          </div>
          <div>
            <span className="detail-list__label">Department</span>
            <span>{section.course.department ?? "Not set"}</span>
          </div>
          <div>
            <span className="detail-list__label">Classroom</span>
            <span>{section.classroom ?? "Not set"}</span>
          </div>
        </div>

        {applyMutation.error && <ErrorAlert error={applyMutation.error} />}
        {applyMutation.isSuccess && (
          <Notice title="Enrollment applied" tone="success">
            The enrollment request completed successfully.
          </Notice>
        )}

        <div className="button-row">
          <Button isLoading={applyMutation.isPending} onClick={() => applyMutation.mutate()} type="button">
            Apply enrollment
          </Button>
          <Button asChild size="md" variant="secondary">
            <Link to={`/my-enrollments?semesterId=${section.semesterId}`}>View my enrollments</Link>
          </Button>
        </div>
      </Card>
    </Page>
  );
}
