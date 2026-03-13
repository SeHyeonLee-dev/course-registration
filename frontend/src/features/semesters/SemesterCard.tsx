import { Link } from "react-router-dom";
import { formatDateRange, formatDateTimeRange } from "../../shared/lib/format";
import { Badge } from "../../shared/ui/Badge";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import type { SemesterItem } from "./types";

export function SemesterCard({ semester }: { semester: SemesterItem }) {
  return (
    <Card subtitle="Semester window and enrollment period" title={semester.name}>
      <div className="detail-list">
        <div>
          <span className="detail-list__label">Term</span>
          <span>{formatDateRange(semester.startDate, semester.endDate)}</span>
        </div>
        <div>
          <span className="detail-list__label">Enrollment</span>
          <span>{formatDateTimeRange(semester.enrollStartAt, semester.enrollEndAt)}</span>
        </div>
      </div>

      <div className="button-row">
        <Badge tone="primary">Semester #{semester.semesterId}</Badge>
        <Button asChild size="sm" variant="secondary">
          <Link to={`/sections?semesterId=${semester.semesterId}`}>Browse sections</Link>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link to={`/my-enrollments?semesterId=${semester.semesterId}`}>My enrollments</Link>
        </Button>
      </div>
    </Card>
  );
}
