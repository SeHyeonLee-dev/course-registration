import { Link } from "react-router-dom";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { Notice } from "../../shared/ui/Notice";
import { Page } from "../../shared/ui/Page";

export function AdminDashboardPage() {
  return (
    <Page description="학기, 과목, 분반을 관리하고 신청 현황을 확인할 수 있습니다." title="관리자">
      <Notice title="과목 ID 입력 안내" tone="info">
        과목 목록 조회 기능이 아직 없어 분반 개설 시 과목 ID를 직접 입력해야 합니다.
      </Notice>

      <div className="summary-grid">
        <Card subtitle="학기를 만들고 신청 기간을 조정할 수 있습니다." title="학기 관리">
          <div className="button-row">
            <Button asChild size="sm" variant="secondary">
              <Link to="/admin/semesters/new">학기 관리하기</Link>
            </Button>
          </div>
        </Card>

        <Card subtitle="분반 개설에 사용할 과목을 등록합니다." title="과목 관리">
          <div className="button-row">
            <Button asChild size="sm" variant="secondary">
              <Link to="/admin/courses/new">과목 등록하기</Link>
            </Button>
          </div>
        </Card>

        <Card subtitle="학기와 과목을 연결해 분반을 개설합니다." title="분반 개설">
          <div className="button-row">
            <Button asChild size="sm" variant="secondary">
              <Link to="/admin/sections/new">분반 개설하기</Link>
            </Button>
          </div>
        </Card>

        <Card subtitle="분반별 신청 인원과 학생 목록을 확인합니다." title="신청 현황">
          <div className="button-row">
            <Button asChild size="sm" variant="secondary">
              <Link to="/admin/sections/enrollments">현황 확인하기</Link>
            </Button>
          </div>
        </Card>
      </div>
    </Page>
  );
}
