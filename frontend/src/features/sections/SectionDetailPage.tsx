import { Link, useParams } from "react-router-dom";
import { formatSchedule, formatSeatSummary } from "../../shared/lib/format";
import { Badge } from "../../shared/ui/Badge";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { ErrorAlert } from "../../shared/ui/ErrorAlert";
import { Notice } from "../../shared/ui/Notice";
import { Page } from "../../shared/ui/Page";
import { useApplyEnrollmentMutation, useSectionDetailQuery } from "./hooks";

export function SectionDetailPage() {
  const { sectionId } = useParams();
  const sectionQuery = useSectionDetailQuery(sectionId);
  const applyMutation = useApplyEnrollmentMutation(sectionId);

  if (sectionQuery.isLoading) {
    return <Page title="강의 상세">강의 정보를 불러오고 있습니다.</Page>;
  }

  if (sectionQuery.error) {
    return (
      <Page title="강의 상세">
        <ErrorAlert error={sectionQuery.error} />
      </Page>
    );
  }

  const section = sectionQuery.data;

  if (!section) {
    return (
      <Page title="강의 상세">
        <Notice title="강의 정보를 찾을 수 없습니다." tone="info">
          선택한 강의 정보를 불러오지 못했습니다.
        </Notice>
      </Page>
    );
  }

  return (
    <Page
      actions={
        <Button asChild size="sm" variant="ghost">
          <Link to={`/sections?semesterId=${section.semesterId}`}>목록으로</Link>
        </Button>
      }
      description="선택한 강의의 시간과 개설 정보를 확인할 수 있습니다."
      title={`${section.course.code} ${section.course.name}`}
    >
      <Card subtitle={`${section.semesterName} / ${section.sectionNo}분반`} title="강의 정보">
        <div className="badge-row">
          <Badge tone="primary">
            {formatSchedule(section.dayOfWeek, section.startPeriod, section.endPeriod)}
          </Badge>
          <Badge>{formatSeatSummary(section.remainingCount, section.capacity)}</Badge>
          <Badge>{section.professorName}</Badge>
        </div>

        <div className="detail-list detail-list--two-columns">
          <div>
            <span className="detail-list__label">과목코드</span>
            <span>{section.course.code}</span>
          </div>
          <div>
            <span className="detail-list__label">학점</span>
            <span>{section.course.credit}</span>
          </div>
          <div>
            <span className="detail-list__label">개설학과</span>
            <span>{section.course.department ?? "미정"}</span>
          </div>
          <div>
            <span className="detail-list__label">강의실</span>
            <span>{section.classroom ?? "미정"}</span>
          </div>
        </div>

        {applyMutation.error && <ErrorAlert error={applyMutation.error} />}
        {applyMutation.isSuccess && (
          <Notice title="수강신청이 완료되었습니다." tone="success">
            신청 내역에서 반영 여부를 확인할 수 있습니다.
          </Notice>
        )}

        <div className="button-row">
          <Button isLoading={applyMutation.isPending} onClick={() => applyMutation.mutate()} type="button">
            신청하기
          </Button>
          <Button asChild size="md" variant="secondary">
            <Link to={`/my-enrollments?semesterId=${section.semesterId}`}>내 신청내역 보기</Link>
          </Button>
        </div>
      </Card>
    </Page>
  );
}
