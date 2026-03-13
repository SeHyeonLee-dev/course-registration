import { formatDayOfWeek } from "../../shared/lib/format";
import { Field } from "../../shared/ui/Field";
import type { SemesterItem } from "../semesters/types";
import type { SectionFilters as SectionFiltersValue } from "./types";

type SectionFiltersProps = {
  filters: SectionFiltersValue;
  onChange: (next: Partial<SectionFiltersValue>) => void;
  semesters: SemesterItem[];
  showSemester?: boolean;
};

export function SectionFilters({
  filters,
  onChange,
  semesters,
  showSemester = true,
}: SectionFiltersProps) {
  return (
    <div className="filters-grid">
      {showSemester && (
        <Field label="학기">
          <select
            onChange={(event) => onChange({ semesterId: event.target.value, page: "0" })}
            value={filters.semesterId}
          >
            <option value="">학기를 선택하세요</option>
            {semesters.map((semester) => (
              <option key={semester.semesterId} value={String(semester.semesterId)}>
                {semester.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="검색어">
        <input
          onChange={(event) => onChange({ keyword: event.target.value, page: "0" })}
          placeholder="과목명 또는 과목코드"
          value={filters.keyword}
        />
      </Field>

      <Field label="요일">
        <select
          onChange={(event) => onChange({ dayOfWeek: event.target.value, page: "0" })}
          value={filters.dayOfWeek}
        >
          <option value="">전체</option>
          <option value="MON">{formatDayOfWeek("MON")}</option>
          <option value="TUE">{formatDayOfWeek("TUE")}</option>
          <option value="WED">{formatDayOfWeek("WED")}</option>
          <option value="THU">{formatDayOfWeek("THU")}</option>
          <option value="FRI">{formatDayOfWeek("FRI")}</option>
          <option value="SAT">{formatDayOfWeek("SAT")}</option>
          <option value="SUN">{formatDayOfWeek("SUN")}</option>
        </select>
      </Field>
    </div>
  );
}
