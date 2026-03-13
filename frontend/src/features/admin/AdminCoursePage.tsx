import { useState } from "react";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { ErrorAlert } from "../../shared/ui/ErrorAlert";
import { Field } from "../../shared/ui/Field";
import { Notice } from "../../shared/ui/Notice";
import { Page } from "../../shared/ui/Page";
import { useCreateCourseMutation } from "./hooks";
import type { AdminCourseCreatePayload, AdminCourseResponse } from "./types";

const INITIAL_FORM: AdminCourseCreatePayload = {
  code: "",
  credit: 3,
  department: "",
  name: "",
};

export function AdminCoursePage() {
  const createCourseMutation = useCreateCourseMutation();
  const [form, setForm] = useState({
    code: INITIAL_FORM.code,
    credit: String(INITIAL_FORM.credit),
    department: INITIAL_FORM.department,
    name: INITIAL_FORM.name,
  });
  const [createdCourse, setCreatedCourse] = useState<AdminCourseResponse | null>(null);

  return (
    <Page description="Create courses for later section creation." title="Admin / Courses">
      <Card subtitle="POST /api/admin/courses" title="Create course">
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            setCreatedCourse(null);

            createCourseMutation.mutate(
              {
                code: form.code,
                credit: Number(form.credit),
                department: form.department,
                name: form.name,
              },
              {
                onSuccess: (response) => {
                  setCreatedCourse(response);
                  setForm({
                    code: "",
                    credit: String(INITIAL_FORM.credit),
                    department: "",
                    name: "",
                  });
                },
              },
            );
          }}
        >
          <div className="filters-grid">
            <Field htmlFor="course-code" hint="Unique course code" label="Code">
              <input
                id="course-code"
                onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
                required
                type="text"
                value={form.code}
              />
            </Field>

            <Field htmlFor="course-name" label="Name">
              <input
                id="course-name"
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
                type="text"
                value={form.name}
              />
            </Field>

            <Field htmlFor="course-credit" label="Credit">
              <input
                id="course-credit"
                min="1"
                onChange={(event) => setForm((current) => ({ ...current, credit: event.target.value }))}
                required
                type="number"
                value={form.credit}
              />
            </Field>

            <Field htmlFor="course-department" label="Department">
              <input
                id="course-department"
                onChange={(event) =>
                  setForm((current) => ({ ...current, department: event.target.value }))
                }
                type="text"
                value={form.department}
              />
            </Field>
          </div>

          {createCourseMutation.error && <ErrorAlert error={createCourseMutation.error} />}

          <div className="button-row">
            <Button isLoading={createCourseMutation.isPending} type="submit">
              Create course
            </Button>
          </div>
        </form>
      </Card>

      {createdCourse && (
        <>
          <Notice title="Course created" tone="success">
            Save course ID <strong>{createdCourse.courseId}</strong>. The repo does not expose a
            course list API for the section form.
          </Notice>

          <Card subtitle="201 Created response" title="Created course">
            <div className="detail-list detail-list--two-columns">
              <div>
                <span className="detail-list__label">Course ID</span>
                <span>{createdCourse.courseId}</span>
              </div>
              <div>
                <span className="detail-list__label">Code</span>
                <span>{createdCourse.code}</span>
              </div>
              <div>
                <span className="detail-list__label">Name</span>
                <span>{createdCourse.name}</span>
              </div>
              <div>
                <span className="detail-list__label">Credit</span>
                <span>{createdCourse.credit}</span>
              </div>
              <div>
                <span className="detail-list__label">Department</span>
                <span>{createdCourse.department ?? "Not set"}</span>
              </div>
            </div>
          </Card>
        </>
      )}
    </Page>
  );
}
