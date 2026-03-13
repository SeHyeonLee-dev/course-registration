import { Link, useSearchParams } from "react-router-dom";
import { formatSchedule, formatSeatSummary } from "../../shared/lib/format";
import { Badge } from "../../shared/ui/Badge";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { ErrorAlert } from "../../shared/ui/ErrorAlert";
import { Field } from "../../shared/ui/Field";
import { Notice } from "../../shared/ui/Notice";
import { Page } from "../../shared/ui/Page";
import { useSemestersQuery } from "../semesters/hooks";
import { SectionFilters } from "./SectionFilters";
import { useSectionsQuery } from "./hooks";
import type { SectionFilters as SectionFiltersValue } from "./types";

const DEFAULT_FILTERS: SectionFiltersValue = {
  dayOfWeek: "",
  keyword: "",
  page: "0",
  semesterId: "",
  size: "20",
};

export function SectionListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const semestersQuery = useSemestersQuery();

  const filters: SectionFiltersValue = {
    dayOfWeek: searchParams.get("dayOfWeek") ?? DEFAULT_FILTERS.dayOfWeek,
    keyword: searchParams.get("keyword") ?? DEFAULT_FILTERS.keyword,
    page: searchParams.get("page") ?? DEFAULT_FILTERS.page,
    semesterId: searchParams.get("semesterId") ?? DEFAULT_FILTERS.semesterId,
    size: searchParams.get("size") ?? DEFAULT_FILTERS.size,
  };

  const sectionsQuery = useSectionsQuery(filters, Boolean(filters.semesterId));

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

  function updateSemester(semesterId: string) {
    updateFilters({ semesterId, page: "0" });
  }

  const semesters = semestersQuery.data?.items ?? [];
  const sections = sectionsQuery.data?.content ?? [];
  const page = sectionsQuery.data?.page ?? 0;
  const totalPages = sectionsQuery.data?.totalPages ?? 0;

  return (
    <Page description="학기를 먼저 선택한 뒤 원하는 강의를 찾아볼 수 있습니다." title="수강신청">
      <Card subtitle="조회할 학기를 먼저 선택하세요." title="학기 선택">
        {semestersQuery.isLoading && (
          <Notice title="불러오는 중" tone="info">
            학기 목록을 불러오고 있습니다.
          </Notice>
        )}

        {semestersQuery.error && <ErrorAlert error={semestersQuery.error} />}

        {!semestersQuery.isLoading && !semestersQuery.error && semesters.length === 0 && (
          <Notice title="학기 정보가 없습니다." tone="info">
            표시할 학기 정보가 없습니다.
          </Notice>
        )}

        {semesters.length > 0 && (
          <Field label="학기">
            <select onChange={(event) => updateSemester(event.target.value)} value={filters.semesterId}>
              <option value="">학기를 선택하세요</option>
              {semesters.map((semester) => (
                <option key={semester.semesterId} value={String(semester.semesterId)}>
                  {semester.name}
                </option>
              ))}
            </select>
          </Field>
        )}
      </Card>

      {filters.semesterId && (
        <Card subtitle="과목명이나 요일로 강의를 빠르게 좁혀보세요." title="강의 검색">
          <SectionFilters
            filters={filters}
            onChange={updateFilters}
            semesters={semesters}
            showSemester={false}
          />
        </Card>
      )}

      {!filters.semesterId && (
        <Notice title="학기를 선택해 주세요." tone="info">
          학기를 고르면 해당 학기에 개설된 강의 목록이 표시됩니다.
        </Notice>
      )}

      {sectionsQuery.error && <ErrorAlert error={sectionsQuery.error} />}

      {filters.semesterId && sectionsQuery.isLoading && (
        <Notice title="불러오는 중" tone="info">
          강의 목록을 불러오고 있습니다.
        </Notice>
      )}

      {filters.semesterId && !sectionsQuery.isLoading && sections.length === 0 && (
        <Notice title="검색 결과가 없습니다." tone="info">
          현재 조건에 맞는 강의가 없습니다.
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
              <Badge>{section.professorName}</Badge>
            </div>

            <div className="detail-list detail-list--two-columns">
              <div>
                <span className="detail-list__label">강의실</span>
                <span>{section.classroom ?? "미정"}</span>
              </div>
              <div>
                <span className="detail-list__label">개설학과</span>
                <span>{section.department ?? "미정"}</span>
              </div>
              <div>
                <span className="detail-list__label">학점</span>
                <span>{section.credit}</span>
              </div>
              <div>
                <span className="detail-list__label">신청 인원</span>
                <span>{section.currentCount}</span>
              </div>
            </div>

            <div className="button-row">
              <Button asChild size="sm" variant="secondary">
                <Link to={`/sections/${section.sectionId}`}>상세 보기</Link>
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
    </Page>
  );
}
