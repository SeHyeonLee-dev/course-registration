import { useState } from "react";
import { formatDateRange, formatDateTimeRange, toDateTimeLocalValue } from "../../shared/lib/format";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { ErrorAlert } from "../../shared/ui/ErrorAlert";
import { Field } from "../../shared/ui/Field";
import { Notice } from "../../shared/ui/Notice";
import { Page } from "../../shared/ui/Page";
import { useSemestersQuery } from "../semesters/hooks";
import { useCreateSemesterMutation, useUpdateSemesterPeriodMutation } from "./hooks";
import type { AdminSemesterCreatePayload, AdminSemesterResponse } from "./types";

const INITIAL_CREATE_FORM: AdminSemesterCreatePayload = {
  endDate: "",
  enrollEndAt: "",
  enrollStartAt: "",
  name: "",
  startDate: "",
};

type UpdatePeriodFormState = {
  enrollEndAt: string;
  enrollStartAt: string;
  semesterId: string;
};

const INITIAL_PERIOD_FORM: UpdatePeriodFormState = {
  enrollEndAt: "",
  enrollStartAt: "",
  semesterId: "",
};

export function AdminSemesterPage() {
  const semestersQuery = useSemestersQuery();
  const createSemesterMutation = useCreateSemesterMutation();
  const updatePeriodMutation = useUpdateSemesterPeriodMutation();
  const [createForm, setCreateForm] = useState(INITIAL_CREATE_FORM);
  const [periodForm, setPeriodForm] = useState(INITIAL_PERIOD_FORM);
  const [createdSemester, setCreatedSemester] = useState<AdminSemesterResponse | null>(null);
  const [updatedSemester, setUpdatedSemester] = useState<AdminSemesterResponse | null>(null);

  const semesters = semestersQuery.data?.items ?? [];

  function setCreateField(field: keyof AdminSemesterCreatePayload, value: string) {
    setCreateForm((current) => ({ ...current, [field]: value }));
  }

  function setSelectedSemester(semesterId: string) {
    const semester = semesters.find((item) => String(item.semesterId) === semesterId);

    setPeriodForm({
      semesterId,
      enrollStartAt: semester ? toDateTimeLocalValue(semester.enrollStartAt) : "",
      enrollEndAt: semester ? toDateTimeLocalValue(semester.enrollEndAt) : "",
    });
  }

  return (
    <Page description="학기를 만들고 수강신청 기간을 조정할 수 있습니다." title="관리자 / 학기">
      <div className="summary-grid">
        <Card subtitle="새 학기를 등록합니다." title="학기 생성">
          <form
            className="stack"
            onSubmit={(event) => {
              event.preventDefault();
              setCreatedSemester(null);

              createSemesterMutation.mutate(createForm, {
                onSuccess: (response) => {
                  setCreatedSemester(response);
                  setPeriodForm({
                    semesterId: String(response.semesterId),
                    enrollStartAt: toDateTimeLocalValue(response.enrollStartAt),
                    enrollEndAt: toDateTimeLocalValue(response.enrollEndAt),
                  });
                  setCreateForm(INITIAL_CREATE_FORM);
                },
              });
            }}
          >
            <div className="filters-grid">
              <Field htmlFor="semester-name" hint="예: 2026-2" label="학기명">
                <input
                  id="semester-name"
                  onChange={(event) => setCreateField("name", event.target.value)}
                  required
                  type="text"
                  value={createForm.name}
                />
              </Field>

              <Field htmlFor="semester-start-date" label="학기 시작일">
                <input
                  id="semester-start-date"
                  onChange={(event) => setCreateField("startDate", event.target.value)}
                  required
                  type="date"
                  value={createForm.startDate}
                />
              </Field>

              <Field htmlFor="semester-end-date" label="학기 종료일">
                <input
                  id="semester-end-date"
                  onChange={(event) => setCreateField("endDate", event.target.value)}
                  required
                  type="date"
                  value={createForm.endDate}
                />
              </Field>

              <Field htmlFor="semester-enroll-start" label="신청 시작일시">
                <input
                  id="semester-enroll-start"
                  onChange={(event) => setCreateField("enrollStartAt", event.target.value)}
                  required
                  type="datetime-local"
                  value={createForm.enrollStartAt}
                />
              </Field>

              <Field htmlFor="semester-enroll-end" label="신청 종료일시">
                <input
                  id="semester-enroll-end"
                  onChange={(event) => setCreateField("enrollEndAt", event.target.value)}
                  required
                  type="datetime-local"
                  value={createForm.enrollEndAt}
                />
              </Field>
            </div>

            {createSemesterMutation.error && <ErrorAlert error={createSemesterMutation.error} />}

            <div className="button-row">
              <Button isLoading={createSemesterMutation.isPending} type="submit">
                학기 생성
              </Button>
            </div>
          </form>
        </Card>

        <Card subtitle="등록된 학기의 수강신청 기간을 수정합니다." title="신청 기간 수정">
          {semestersQuery.error && <ErrorAlert error={semestersQuery.error} />}

          {semesters.length === 0 ? (
            <Notice title="등록된 학기가 없습니다." tone="info">
              먼저 학기를 생성해 주세요.
            </Notice>
          ) : (
            <form
              className="stack"
              onSubmit={(event) => {
                event.preventDefault();
                setUpdatedSemester(null);

                updatePeriodMutation.mutate(
                  {
                    semesterId: Number(periodForm.semesterId),
                    payload: {
                      enrollStartAt: periodForm.enrollStartAt,
                      enrollEndAt: periodForm.enrollEndAt,
                    },
                  },
                  {
                    onSuccess: (response) => {
                      setUpdatedSemester(response);
                      setPeriodForm({
                        semesterId: String(response.semesterId),
                        enrollStartAt: toDateTimeLocalValue(response.enrollStartAt),
                        enrollEndAt: toDateTimeLocalValue(response.enrollEndAt),
                      });
                    },
                  },
                );
              }}
            >
              <div className="filters-grid">
                <Field htmlFor="semester-select" label="학기">
                  <select
                    id="semester-select"
                    onChange={(event) => setSelectedSemester(event.target.value)}
                    required
                    value={periodForm.semesterId}
                  >
                    <option value="">학기를 선택하세요</option>
                    {semesters.map((semester) => (
                      <option key={semester.semesterId} value={String(semester.semesterId)}>
                        {semester.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field htmlFor="period-start" label="신청 시작일시">
                  <input
                    id="period-start"
                    onChange={(event) =>
                      setPeriodForm((current) => ({ ...current, enrollStartAt: event.target.value }))
                    }
                    required
                    type="datetime-local"
                    value={periodForm.enrollStartAt}
                  />
                </Field>

                <Field htmlFor="period-end" label="신청 종료일시">
                  <input
                    id="period-end"
                    onChange={(event) =>
                      setPeriodForm((current) => ({ ...current, enrollEndAt: event.target.value }))
                    }
                    required
                    type="datetime-local"
                    value={periodForm.enrollEndAt}
                  />
                </Field>
              </div>

              {updatePeriodMutation.error && <ErrorAlert error={updatePeriodMutation.error} />}

              <div className="button-row">
                <Button
                  disabled={!periodForm.semesterId}
                  isLoading={updatePeriodMutation.isPending}
                  type="submit"
                >
                  기간 수정
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>

      {createdSemester && (
        <Card subtitle="새로 등록한 학기 정보입니다." title="생성된 학기">
          <div className="detail-list detail-list--two-columns">
            <div>
              <span className="detail-list__label">학기 ID</span>
              <span>{createdSemester.semesterId}</span>
            </div>
            <div>
              <span className="detail-list__label">학기명</span>
              <span>{createdSemester.name}</span>
            </div>
            <div>
              <span className="detail-list__label">학기 기간</span>
              <span>{formatDateRange(createdSemester.startDate, createdSemester.endDate)}</span>
            </div>
            <div>
              <span className="detail-list__label">신청 기간</span>
              <span>
                {formatDateTimeRange(createdSemester.enrollStartAt, createdSemester.enrollEndAt)}
              </span>
            </div>
          </div>
        </Card>
      )}

      {updatedSemester && (
        <Notice title="수강신청 기간을 수정했습니다." tone="success">
          {updatedSemester.name}:{" "}
          {formatDateTimeRange(updatedSemester.enrollStartAt, updatedSemester.enrollEndAt)}
        </Notice>
      )}
    </Page>
  );
}
