import { ErrorAlert } from "../../shared/ui/ErrorAlert";
import { Notice } from "../../shared/ui/Notice";
import { Page } from "../../shared/ui/Page";
import { useSemestersQuery } from "./hooks";
import { SemesterCard } from "./SemesterCard";

export function SemesterListPage() {
  const semestersQuery = useSemestersQuery();

  if (semestersQuery.isLoading) {
    return <Page title="학기">학기 정보를 불러오고 있습니다.</Page>;
  }

  if (semestersQuery.error) {
    return (
      <Page title="학기" description="개설된 학기와 수강신청 기간을 확인할 수 있습니다.">
        <ErrorAlert error={semestersQuery.error} />
      </Page>
    );
  }

  const semesters = semestersQuery.data?.items ?? [];

  return (
    <Page title="학기" description="개설된 학기와 수강신청 기간을 확인할 수 있습니다.">
      {semesters.length === 0 ? (
        <Notice title="학기 정보가 없습니다." tone="info">
          현재 조회할 수 있는 학기 정보가 없습니다.
        </Notice>
      ) : (
        <div className="stack">
          {semesters.map((semester) => (
            <SemesterCard key={semester.semesterId} semester={semester} />
          ))}
        </div>
      )}
    </Page>
  );
}
