import { Link } from "react-router-dom";
import { useState } from "react";
import { formatDayOfWeek, formatSchedule } from "../../shared/lib/format";
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
    <Page description="학기와 과목을 연결해 분반을 개설할 수 있습니다." title="관리자 / 분반">
      <Notice title="과목 ID 입력 안내" tone="info">
        과목 목록 조회 기능이 아직 없어 과목 등록 후 생성된 과목 ID를 직접 입력해야 합니다.
      </Notice>

      <Card subtitle="새 분반을 개설합니다." title="분반 개설">
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
            <Field htmlFor="section-semester" label="학기">
              <select
                id="section-semester"
                onChange={(event) =>
                  setForm((current) => ({ ...current, semesterId: event.target.value }))
                }
                required
                value={form.semesterId}
              >
                <option value="">학기를 선택하세요</option>
                {semesters.map((semester) => (
                  <option key={semester.semesterId} value={String(semester.semesterId)}>
                    {semester.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field htmlFor="section-course-id" label="과목 ID">
              <input
                id="section-course-id"
                min="1"
                onChange={(event) => setForm((current) => ({ ...current, courseId: event.target.value }))}
                required
                type="number"
                value={form.courseId}
              />
            </Field>

            <Field htmlFor="section-number" label="분반">
              <input
                id="section-number"
                onChange={(event) => setForm((current) => ({ ...current, sectionNo: event.target.value }))}
                required
                type="text"
                value={form.sectionNo}
              />
            </Field>

            <Field htmlFor="section-professor" label="교수명">
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

            <Field htmlFor="section-classroom" label="강의실">
              <input
                id="section-classroom"
                onChange={(event) => setForm((current) => ({ ...current, classroom: event.target.value }))}
                type="text"
                value={form.classroom}
              />
            </Field>

            <Field htmlFor="section-day" label="요일">
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
                    {formatDayOfWeek(dayOfWeek)}
                  </option>
                ))}
              </select>
            </Field>

            <Field htmlFor="section-start-period" label="시작 교시">
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

            <Field htmlFor="section-end-period" label="종료 교시">
              <input
                id="section-end-period"
                min="1"
                onChange={(event) => setForm((current) => ({ ...current, endPeriod: event.target.value }))}
                required
                type="number"
                value={form.endPeriod}
              />
            </Field>

            <Field htmlFor="section-capacity" label="정원">
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
              분반 개설
            </Button>
          </div>
        </form>
      </Card>

      {createdSection && (
        <Card subtitle="방금 개설한 분반 정보입니다." title="개설된 분반">
          <div className="badge-row">
            <Badge tone="primary">
              {formatSchedule(
                createdSection.dayOfWeek,
                createdSection.startPeriod,
                createdSection.endPeriod,
              )}
            </Badge>
            <Badge>{createdSection.professorName}</Badge>
            <Badge>분반 ID {createdSection.sectionId}</Badge>
          </div>

          <div className="detail-list detail-list--two-columns">
            <div>
              <span className="detail-list__label">과목</span>
              <span>
                {createdSection.courseCode} {createdSection.courseName}
              </span>
            </div>
            <div>
              <span className="detail-list__label">학기</span>
              <span>{createdSection.semesterName}</span>
            </div>
            <div>
              <span className="detail-list__label">분반</span>
              <span>{createdSection.sectionNo}</span>
            </div>
            <div>
              <span className="detail-list__label">정원</span>
              <span>{createdSection.capacity}</span>
            </div>
            <div>
              <span className="detail-list__label">강의실</span>
              <span>{createdSection.classroom ?? "미정"}</span>
            </div>
          </div>

          <div className="button-row">
            <Button asChild size="sm" variant="secondary">
              <Link to={`/admin/sections/${createdSection.sectionId}/enrollments`}>
                신청 현황 보기
              </Link>
            </Button>
          </div>
        </Card>
      )}
    </Page>
  );
}
