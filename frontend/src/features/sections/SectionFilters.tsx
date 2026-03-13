import { Field } from "../../shared/ui/Field";
import type { SemesterItem } from "../semesters/types";
import type { SectionFilters as SectionFiltersValue } from "./types";

type SectionFiltersProps = {
  filters: SectionFiltersValue;
  onChange: (next: Partial<SectionFiltersValue>) => void;
  semesters: SemesterItem[];
};

export function SectionFilters({ filters, onChange, semesters }: SectionFiltersProps) {
  return (
    <div className="filters-grid">
      <Field label="Semester">
        <select
          onChange={(event) => onChange({ semesterId: event.target.value, page: "0" })}
          value={filters.semesterId}
        >
          <option value="">Select semester</option>
          {semesters.map((semester) => (
            <option key={semester.semesterId} value={String(semester.semesterId)}>
              {semester.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Keyword">
        <input
          onChange={(event) => onChange({ keyword: event.target.value, page: "0" })}
          placeholder="Course name or code"
          value={filters.keyword}
        />
      </Field>

      <Field label="Day of week">
        <select
          onChange={(event) => onChange({ dayOfWeek: event.target.value, page: "0" })}
          value={filters.dayOfWeek}
        >
          <option value="">All</option>
          <option value="MON">MON</option>
          <option value="TUE">TUE</option>
          <option value="WED">WED</option>
          <option value="THU">THU</option>
          <option value="FRI">FRI</option>
          <option value="SAT">SAT</option>
          <option value="SUN">SUN</option>
        </select>
      </Field>
    </div>
  );
}
