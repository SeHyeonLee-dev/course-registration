import { formatDayOfWeek } from "../../shared/lib/format";
import { Card } from "../../shared/ui/Card";
import { Notice } from "../../shared/ui/Notice";
import type { TimetableItem } from "./types";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

export function TimetableGrid({ timetable }: { timetable: Record<string, TimetableItem[]> }) {
  const hasItems = DAYS.some((day) => (timetable[day] ?? []).length > 0);

  if (!hasItems) {
    return (
      <Notice title="표시할 시간표가 없습니다." tone="info">
        신청한 강의가 시간표에 반영되면 이곳에 표시됩니다.
      </Notice>
    );
  }

  return (
    <div className="timetable-grid">
      {DAYS.map((day) => (
        <Card key={day} subtitle="신청한 강의" title={`${formatDayOfWeek(day)}요일`}>
          {(timetable[day] ?? []).length === 0 ? (
            <div className="timetable-empty">수업 없음</div>
          ) : (
            <div className="stack">
              {(timetable[day] ?? []).map((item) => (
                <div key={item.enrollmentId} className="timetable-item">
                  <strong>{item.courseCode}</strong>
                  <span>{item.courseName}</span>
                  <span>
                    {item.startPeriod}~{item.endPeriod}교시
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
