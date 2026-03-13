import { Card } from "../../shared/ui/Card";
import { Notice } from "../../shared/ui/Notice";
import type { TimetableItem } from "./types";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

export function TimetableGrid({ timetable }: { timetable: Record<string, TimetableItem[]> }) {
  const hasItems = DAYS.some((day) => (timetable[day] ?? []).length > 0);

  if (!hasItems) {
    return (
      <Notice title="No timetable" tone="info">
        No enrolled sections are currently reflected in the timetable.
      </Notice>
    );
  }

  return (
    <div className="timetable-grid">
      {DAYS.map((day) => (
        <Card key={day} subtitle="Registered blocks" title={day}>
          {(timetable[day] ?? []).length === 0 ? (
            <div className="timetable-empty">No classes</div>
          ) : (
            <div className="stack">
              {(timetable[day] ?? []).map((item) => (
                <div key={item.enrollmentId} className="timetable-item">
                  <strong>{item.courseCode}</strong>
                  <span>{item.courseName}</span>
                  <span>
                    {item.startPeriod}-{item.endPeriod}
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
