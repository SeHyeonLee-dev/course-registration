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
    <Page description="분반 개설에 사용할 과목을 등록할 수 있습니다." title="관리자 / 과목">
      <Card subtitle="새 과목을 등록합니다." title="과목 등록">
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
            <Field htmlFor="course-code" hint="중복되지 않는 과목코드를 입력하세요." label="과목코드">
              <input
                id="course-code"
                onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
                required
                type="text"
                value={form.code}
              />
            </Field>

            <Field htmlFor="course-name" label="과목명">
              <input
                id="course-name"
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
                type="text"
                value={form.name}
              />
            </Field>

            <Field htmlFor="course-credit" label="학점">
              <input
                id="course-credit"
                min="1"
                onChange={(event) => setForm((current) => ({ ...current, credit: event.target.value }))}
                required
                type="number"
                value={form.credit}
              />
            </Field>

            <Field htmlFor="course-department" label="개설학과">
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
              과목 등록
            </Button>
          </div>
        </form>
      </Card>

      {createdCourse && (
        <>
          <Notice title="과목이 등록되었습니다." tone="success">
            분반 개설에 사용할 과목 ID는 <strong>{createdCourse.courseId}</strong>입니다.
          </Notice>

          <Card subtitle="방금 등록한 과목 정보입니다." title="등록된 과목">
            <div className="detail-list detail-list--two-columns">
              <div>
                <span className="detail-list__label">과목 ID</span>
                <span>{createdCourse.courseId}</span>
              </div>
              <div>
                <span className="detail-list__label">과목코드</span>
                <span>{createdCourse.code}</span>
              </div>
              <div>
                <span className="detail-list__label">과목명</span>
                <span>{createdCourse.name}</span>
              </div>
              <div>
                <span className="detail-list__label">학점</span>
                <span>{createdCourse.credit}</span>
              </div>
              <div>
                <span className="detail-list__label">개설학과</span>
                <span>{createdCourse.department ?? "미정"}</span>
              </div>
            </div>
          </Card>
        </>
      )}
    </Page>
  );
}
