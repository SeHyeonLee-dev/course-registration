import { Link } from "react-router-dom";
import { useState } from "react";
import { formatSchedule } from "../../shared/lib/format";
import { Badge } from "../../shared/ui/Badge";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { ErrorAlert } from "../../shared/ui/ErrorAlert";
import { Field } from "../../shared/ui/Field";
import { Notice } from "../../shared/ui/Notice";
import { Page } from "../../shared/ui/Page";
import { useSemestersQuery } from "../semesters/hooks";
import { useCreateSectionMutation } from "./hooks";
import type { AdminSectionCreatePayload, AdminSectionResponse, DayOfWeek } from "./types";

const DAY_OPTIONS: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const INITIAL_FORM = {
  capacity: "30",
  classroom: "",
  courseId: "",
  dayOfWeek: "MON" as DayOfWeek,
  endPeriod: "3",
  professorName: "",
  sectionNo: "01",
  semesterId: "",
  startPeriod: "1",
};

export function AdminSectionPage() {
  const semestersQuery = useSemestersQuery();
  const createSectionMutation = useCreateSectionMutation();
  const [form, setForm] = useState(INITIAL_FORM);
  const [createdSection, setCreatedSection] = useState<AdminSectionResponse | null>(null);
  const semesters = semestersQuery.data?.items ?? [];

  return (
    <Page
      description="Create sections from semester, course, schedule, and capacity inputs."
      title="Admin / Sections"
    >
      <Notice title="Course ID is manual" tone="info">
        No course lookup endpoint was found in the repo. Use the course ID returned by the course
        creation screen.
      </Notice>

      <Card subtitle="POST /api/admin/sections" title="Create section">
        {semestersQuery.error && <ErrorAlert error={semestersQuery.error} />}

        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            setCreatedSection(null);

            createSectionMutation.mutate(
              {
                capacity: Number(form.capacity),
                classroom: form.classroom,
                courseId: Number(form.courseId),
                dayOfWeek: form.dayOfWeek,
                endPeriod: Number(form.endPeriod),
                professorName: form.professorName,
                sectionNo: form.sectionNo,
                semesterId: Number(form.semesterId),
                startPeriod: Number(form.startPeriod),
              } satisfies AdminSectionCreatePayload,
              {
                onSuccess: (response) => {
                  setCreatedSection(response);
                  setForm((current) => ({
                    ...current,
                    classroom: "",
                    professorName: "",
                    sectionNo: "01",
                  }));
                },
              },
            );
          }}
        >
          <div className="filters-grid">
            <Field htmlFor="section-semester" label="Semester">
              <select
                id="section-semester"
                onChange={(event) =>
                  setForm((current) => ({ ...current, semesterId: event.target.value }))
                }
                required
                value={form.semesterId}
              >
                <option value="">Select semester</option>
                {semesters.map((semester) => (
                  <option key={semester.semesterId} value={String(semester.semesterId)}>
                    {semester.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field htmlFor="section-course-id" label="Course ID">
              <input
                id="section-course-id"
                min="1"
                onChange={(event) => setForm((current) => ({ ...current, courseId: event.target.value }))}
                required
                type="number"
                value={form.courseId}
              />
            </Field>

            <Field htmlFor="section-number" label="Section No">
              <input
                id="section-number"
                onChange={(event) => setForm((current) => ({ ...current, sectionNo: event.target.value }))}
                required
                type="text"
                value={form.sectionNo}
              />
            </Field>

            <Field htmlFor="section-professor" label="Professor">
              <input
                id="section-professor"
                onChange={(event) =>
                  setForm((current) => ({ ...current, professorName: event.target.value }))
                }
                required
                type="text"
                value={form.professorName}
              />
            </Field>

            <Field htmlFor="section-classroom" label="Classroom">
              <input
                id="section-classroom"
                onChange={(event) => setForm((current) => ({ ...current, classroom: event.target.value }))}
                type="text"
                value={form.classroom}
              />
            </Field>

            <Field htmlFor="section-day" label="Day of week">
              <select
                id="section-day"
                onChange={(event) =>
                  setForm((current) => ({ ...current, dayOfWeek: event.target.value as DayOfWeek }))
                }
                required
                value={form.dayOfWeek}
              >
                {DAY_OPTIONS.map((dayOfWeek) => (
                  <option key={dayOfWeek} value={dayOfWeek}>
                    {dayOfWeek}
                  </option>
                ))}
              </select>
            </Field>

            <Field htmlFor="section-start-period" label="Start period">
              <input
                id="section-start-period"
                min="1"
                onChange={(event) =>
                  setForm((current) => ({ ...current, startPeriod: event.target.value }))
                }
                required
                type="number"
                value={form.startPeriod}
              />
            </Field>

            <Field htmlFor="section-end-period" label="End period">
              <input
                id="section-end-period"
                min="1"
                onChange={(event) => setForm((current) => ({ ...current, endPeriod: event.target.value }))}
                required
                type="number"
                value={form.endPeriod}
              />
            </Field>

            <Field htmlFor="section-capacity" label="Capacity">
              <input
                id="section-capacity"
                min="1"
                onChange={(event) => setForm((current) => ({ ...current, capacity: event.target.value }))}
                required
                type="number"
                value={form.capacity}
              />
            </Field>
          </div>

          {createSectionMutation.error && <ErrorAlert error={createSectionMutation.error} />}

          <div className="button-row">
            <Button isLoading={createSectionMutation.isPending} type="submit">
              Create section
            </Button>
          </div>
        </form>
      </Card>

      {createdSection && (
        <Card subtitle="201 Created response" title="Created section">
          <div className="badge-row">
            <Badge tone="primary">
              {formatSchedule(
                createdSection.dayOfWeek,
                createdSection.startPeriod,
                createdSection.endPeriod,
              )}
            </Badge>
            <Badge>{createdSection.professorName}</Badge>
            <Badge>Section ID #{createdSection.sectionId}</Badge>
          </div>

          <div className="detail-list detail-list--two-columns">
            <div>
              <span className="detail-list__label">Course</span>
              <span>
                {createdSection.courseCode} {createdSection.courseName}
              </span>
            </div>
            <div>
              <span className="detail-list__label">Semester</span>
              <span>{createdSection.semesterName}</span>
            </div>
            <div>
              <span className="detail-list__label">Section No</span>
              <span>{createdSection.sectionNo}</span>
            </div>
            <div>
              <span className="detail-list__label">Capacity</span>
              <span>{createdSection.capacity}</span>
            </div>
            <div>
              <span className="detail-list__label">Classroom</span>
              <span>{createdSection.classroom ?? "Not set"}</span>
            </div>
          </div>

          <div className="button-row">
            <Button asChild size="sm" variant="secondary">
              <Link to={`/admin/sections/${createdSection.sectionId}/enrollments`}>
                View enrollment status
              </Link>
            </Button>
          </div>
        </Card>
      )}
    </Page>
  );
}
