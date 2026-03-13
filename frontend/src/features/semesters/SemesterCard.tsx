import { Link } from "react-router-dom";
import { formatDateRange, formatDateTimeRange } from "../../shared/lib/format";
import { Badge } from "../../shared/ui/Badge";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import type { SemesterItem } from "./types";

export function SemesterCard({ semester }: { semester: SemesterItem }) {
  return (
    <Card subtitle="학기 일정과 수강신청 기간" title={semester.name}>
      <div className="detail-list">
        <div>
          <span className="detail-list__label">학기 기간</span>
          <span>{formatDateRange(semester.startDate, semester.endDate)}</span>
        </div>
        <div>
          <span className="detail-list__label">신청 기간</span>
          <span>{formatDateTimeRange(semester.enrollStartAt, semester.enrollEndAt)}</span>
        </div>
      </div>

      <div className="button-row">
        <Badge tone="primary">학기 ID {semester.semesterId}</Badge>
        <Button asChild size="sm" variant="secondary">
          <Link to={`/sections?semesterId=${semester.semesterId}`}>강의 보기</Link>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link to={`/my-enrollments?semesterId=${semester.semesterId}`}>내 신청내역</Link>
        </Button>
      </div>
    </Card>
  );
}
