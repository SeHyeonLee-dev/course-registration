import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { formatDateTime, formatSchedule, formatSeatSummary } from "../../shared/lib/format";
import { Badge } from "../../shared/ui/Badge";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { ErrorAlert } from "../../shared/ui/ErrorAlert";
import { Field } from "../../shared/ui/Field";
import { Notice } from "../../shared/ui/Notice";
import { Page } from "../../shared/ui/Page";
import { useSectionsQuery } from "../sections/hooks";
import { SectionFilters } from "../sections/SectionFilters";
import type { SectionFilters as SectionFiltersValue } from "../sections/types";
import { useSemestersQuery } from "../semesters/hooks";
import { useAdminSectionEnrollmentStatusQuery } from "./hooks";

const DEFAULT_FILTERS: SectionFiltersValue = {
  dayOfWeek: "",
  keyword: "",
  page: "0",
  semesterId: "",
  size: "20",
};

export function AdminSectionEnrollmentStatusPage() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const semestersQuery = useSemestersQuery();
  const statusQuery = useAdminSectionEnrollmentStatusQuery(sectionId);

  const filters: SectionFiltersValue = {
    dayOfWeek: searchParams.get("dayOfWeek") ?? DEFAULT_FILTERS.dayOfWeek,
    keyword: searchParams.get("keyword") ?? DEFAULT_FILTERS.keyword,
    page: searchParams.get("page") ?? DEFAULT_FILTERS.page,
    semesterId: searchParams.get("semesterId") ?? DEFAULT_FILTERS.semesterId,
    size: searchParams.get("size") ?? DEFAULT_FILTERS.size,
  };

  const sectionsQuery = useSectionsQuery(filters, Boolean(filters.semesterId));
  const semesters = semestersQuery.data?.items ?? [];
  const sections = sectionsQuery.data?.content ?? [];
  const page = sectionsQuery.data?.page ?? 0;
  const status = statusQuery.data;
  const totalPages = sectionsQuery.data?.totalPages ?? 0;

  function updateFilters(next: Partial<SectionFiltersValue>) {
    const params = new URLSearchParams(searchParams);

    (Object.keys(DEFAULT_FILTERS) as Array<keyof SectionFiltersValue>).forEach((key) => {
      const value = next[key] ?? filters[key];

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    setSearchParams(params, { replace: true });
  }

  function selectSection(nextSectionId: number) {
    const query = searchParams.toString();
    navigate(`/admin/sections/${nextSectionId}/enrollments${query ? `?${query}` : ""}`);
  }

  return (
    <Page description="분반별 신청 인원과 학생 목록을 확인할 수 있습니다." title="관리자 / 신청 현황">
      <Card subtitle="학기를 고르고 원하는 분반을 선택하세요." title="분반 찾기">
        <SectionFilters filters={filters} onChange={updateFilters} semesters={semesters} />
      </Card>

      {!filters.semesterId && (
        <Notice title="학기를 선택해 주세요." tone="info">
          학기를 선택하면 분반 목록을 조회할 수 있습니다.
        </Notice>
      )}

      {semestersQuery.error && <ErrorAlert error={semestersQuery.error} />}
      {sectionsQuery.error && <ErrorAlert error={sectionsQuery.error} />}

      {filters.semesterId && sectionsQuery.isLoading && (
        <Notice title="불러오는 중" tone="info">
          분반 목록을 불러오고 있습니다.
        </Notice>
      )}

      {filters.semesterId && !sectionsQuery.isLoading && sections.length === 0 && (
        <Notice title="조회 결과가 없습니다." tone="info">
          현재 조건에 맞는 분반이 없습니다.
        </Notice>
      )}

      <div className="stack">
        {sections.map((section) => (
          <Card
            key={section.sectionId}
            subtitle={`${section.courseCode} / ${section.semesterName}`}
            title={`${section.courseName} ${section.sectionNo}분반`}
          >
            <div className="badge-row">
              <Badge tone="primary">
                {formatSchedule(section.dayOfWeek, section.startPeriod, section.endPeriod)}
              </Badge>
              <Badge>{formatSeatSummary(section.remainingCount, section.capacity)}</Badge>
              <Badge>분반 ID {section.sectionId}</Badge>
            </div>

            <div className="button-row">
              <Button
                onClick={() => selectSection(section.sectionId)}
                size="sm"
                type="button"
                variant={String(section.sectionId) === sectionId ? "primary" : "secondary"}
              >
                {String(section.sectionId) === sectionId ? "선택됨" : "신청 현황 보기"}
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link to={`/sections/${section.sectionId}`}>강의 상세 보기</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <Button
            disabled={page <= 0}
            onClick={() => updateFilters({ page: String(page - 1) })}
            size="sm"
            type="button"
            variant="secondary"
          >
            이전
          </Button>
          <span className="pagination__status">
            {page + 1} / {totalPages} 페이지
          </span>
          <Button
            disabled={page + 1 >= totalPages}
            onClick={() => updateFilters({ page: String(page + 1) })}
            size="sm"
            type="button"
            variant="secondary"
          >
            다음
          </Button>
        </div>
      )}

      {!sectionId && (
        <Notice title="분반을 선택해 주세요." tone="info">
          목록에서 분반을 고르면 신청 현황이 표시됩니다.
        </Notice>
      )}

      {statusQuery.error && <ErrorAlert error={statusQuery.error} />}

      {statusQuery.isLoading && sectionId && (
        <Notice title="불러오는 중" tone="info">
          신청 현황을 불러오고 있습니다.
        </Notice>
      )}

      {status && (
        <>
          <Card subtitle={`${status.courseCode} / ${status.semesterName} / ${status.sectionNo}분반`} title="분반 현황">
            <div className="badge-row">
              <Badge tone="primary">
                {formatSchedule(status.dayOfWeek, status.startPeriod, status.endPeriod)}
              </Badge>
              <Badge>{formatSeatSummary(status.remainingCount, status.capacity)}</Badge>
              <Badge>{status.professorName}</Badge>
            </div>

            <div className="detail-list detail-list--two-columns">
              <div>
                <span className="detail-list__label">분반 ID</span>
                <span>{status.sectionId}</span>
              </div>
              <div>
                <span className="detail-list__label">신청 인원</span>
                <span>{status.currentCount}</span>
              </div>
              <div>
                <span className="detail-list__label">잔여 좌석</span>
                <span>{status.remainingCount}</span>
              </div>
              <div>
                <span className="detail-list__label">정원</span>
                <span>{status.capacity}</span>
              </div>
            </div>
          </Card>

          <Card subtitle="최근 신청 순서대로 표시됩니다." title="신청 학생 목록">
            {status.enrollments.length === 0 ? (
              <Notice title="신청한 학생이 없습니다." tone="info">
                아직 이 분반에 신청한 학생이 없습니다.
              </Notice>
            ) : (
              <div className="stack">
                {status.enrollments.map((enrollment) => (
                  <Card
                    key={enrollment.enrollmentId}
                    subtitle={`학번 ${enrollment.studentNumber}`}
                    title={enrollment.studentName}
                  >
                    <div className="detail-list detail-list--two-columns">
                      <div>
                        <span className="detail-list__label">신청 ID</span>
                        <span>{enrollment.enrollmentId}</span>
                      </div>
                      <div>
                        <span className="detail-list__label">학생 ID</span>
                        <span>{enrollment.studentId}</span>
                      </div>
                      <div>
                        <span className="detail-list__label">신청 시각</span>
                        <span>{formatDateTime(enrollment.enrolledAt)}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      <Card subtitle="분반 ID를 알고 있다면 바로 이동할 수 있습니다." title="분반 ID로 이동">
        <SectionIdJumpForm sectionId={sectionId} />
      </Card>
    </Page>
  );
}

function SectionIdJumpForm({ sectionId }: { sectionId: string | undefined }) {
  const navigate = useNavigate();
  const [value, setValue] = useState(sectionId ?? "");

  useEffect(() => {
    setValue(sectionId ?? "");
  }, [sectionId]);

  return (
    <form
      className="inline-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!value) {
          return;
        }

        navigate(`/admin/sections/${value}/enrollments`);
      }}
    >
      <Field htmlFor="section-id-jump" label="분반 ID">
        <input
          id="section-id-jump"
          min="1"
          onChange={(event) => setValue(event.target.value)}
          placeholder="분반 ID를 입력하세요"
          required
          type="number"
          value={value}
        />
      </Field>

      <div className="button-row">
        <Button type="submit" variant="secondary">
          불러오기
        </Button>
      </div>
    </form>
  );
}
