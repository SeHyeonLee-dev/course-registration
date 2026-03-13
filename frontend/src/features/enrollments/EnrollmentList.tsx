import { formatSchedule } from "../../shared/lib/format";
import { Badge } from "../../shared/ui/Badge";
import { Card } from "../../shared/ui/Card";
import { CancelEnrollmentButton } from "./CancelEnrollmentButton";
import type { MyEnrollmentItem } from "./types";

export function EnrollmentList({ items }: { items: MyEnrollmentItem[] }) {
  return (
    <div className="stack">
      {items.map((item) => (
        <Card
          key={item.enrollmentId}
          subtitle={`${item.courseCode} • ${item.semesterName}`}
          title={`${item.courseName} - ${item.sectionNo}`}
        >
          <div className="badge-row">
            <Badge tone="primary">{formatSchedule(item.dayOfWeek, item.startPeriod, item.endPeriod)}</Badge>
            <Badge>{item.professorName}</Badge>
            <Badge>{item.credit} credits</Badge>
          </div>

          <div className="button-row">
            <CancelEnrollmentButton enrollmentId={item.enrollmentId} />
          </div>
        </Card>
      ))}
    </div>
  );
}
