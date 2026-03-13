import { useSearchParams } from "react-router-dom";
import { Card } from "../../shared/ui/Card";
import { ErrorAlert } from "../../shared/ui/ErrorAlert";
import { Field } from "../../shared/ui/Field";
import { Notice } from "../../shared/ui/Notice";
import { Page } from "../../shared/ui/Page";
import { useSemestersQuery } from "../semesters/hooks";
import { EnrollmentList } from "./EnrollmentList";
import { TimetableGrid } from "./TimetableGrid";
import { useMyEnrollmentsQuery } from "./hooks";

export function MyEnrollmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const semesterId = searchParams.get("semesterId");
  const semestersQuery = useSemestersQuery();
  const enrollmentsQuery = useMyEnrollmentsQuery(semesterId);

  const semesters = semestersQuery.data?.items ?? [];
  const enrollmentData = enrollmentsQuery.data;

  return (
    <Page description="신청한 강의와 시간표를 한 번에 확인할 수 있습니다." title="내 신청내역">
      <Card subtitle="학기별로 신청 내역을 확인할 수 있습니다." title="학기 선택">
        <Field label="학기">
          <select
            onChange={(event) => {
              const value = event.target.value;
              const params = new URLSearchParams(searchParams);
              if (value) {
                params.set("semesterId", value);
              } else {
                params.delete("semesterId");
              }
              setSearchParams(params, { replace: true });
            }}
            value={semesterId ?? ""}
          >
            <option value="">전체 학기</option>
            {semesters.map((semester) => (
              <option key={semester.semesterId} value={String(semester.semesterId)}>
                {semester.name}
              </option>
            ))}
          </select>
        </Field>
      </Card>

      {enrollmentsQuery.isLoading && (
        <Notice title="불러오는 중" tone="info">
          신청 내역을 불러오고 있습니다.
        </Notice>
      )}

      {enrollmentsQuery.error && <ErrorAlert error={enrollmentsQuery.error} />}

      {enrollmentData && (
        <>
          <div className="summary-grid">
            <Card title="신청 학점 현황">
              <div className="summary-metric">
                <span className="summary-metric__label">신청 학점</span>
                <strong>{enrollmentData.appliedCredit}</strong>
              </div>
              <div className="summary-metric">
                <span className="summary-metric__label">남은 학점</span>
                <strong>{enrollmentData.remainingCredit}</strong>
              </div>
              <div className="summary-metric">
                <span className="summary-metric__label">최대 학점</span>
                <strong>{enrollmentData.maxCredit}</strong>
              </div>
            </Card>
          </div>

          {enrollmentData.items.length === 0 ? (
            <Notice title="신청한 강의가 없습니다." tone="info">
              선택한 학기에 신청한 강의가 없습니다.
            </Notice>
          ) : (
            <EnrollmentList items={enrollmentData.items} />
          )}

          <Card subtitle="요일별로 신청한 강의를 확인할 수 있습니다." title="시간표">
            <TimetableGrid timetable={enrollmentData.timetable} />
          </Card>
        </>
      )}
    </Page>
  );
}
