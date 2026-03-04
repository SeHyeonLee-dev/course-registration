# 수강신청 시스템 API 명세서

## 1. 개요
- Base URL: `/api`
- Content-Type: `application/json; charset=utf-8`
- 인증 방식: 세션 기반 로그인(`JSESSIONID` 쿠키)
- 시간 포맷
  - `LocalDate`: `yyyy-MM-dd`
  - `LocalDateTime`: `yyyy-MM-dd'T'HH:mm:ss`

## 2. 공통 응답 규격

### 2.1 성공 응답
- 조회: `200 OK`
- 생성: `201 Created`
- 삭제: `204 No Content`

### 2.2 오류 응답
오류 발생 시 아래 형식을 사용한다.

```json
{
  "code": "COMMON-404",
  "message": "요청한 리소스를 찾을 수 없습니다.",
  "status": 404,
  "path": "/api/sections/10",
  "timestamp": "2026-03-02T10:30:00",
  "fieldErrors": {
    "semesterId": "학기 ID는 필수입니다."
  }
}
```

- `fieldErrors`는 검증 실패(400)일 때만 포함한다.

## 3. 학생 API

### 3.1 로그인
- `POST /api/auth/login`

Request Body
```json
{
  "studentNumber": "20230001",
  "password": "plain-password"
}
```

Response `200 OK`
```json
{
  "studentId": 1,
  "studentNumber": "20230001",
  "name": "홍길동",
  "maxCredit": 18
}
```

오류 코드
- `COMMON-400`: 요청 형식 오류
- `COMMON-404`: 학번 미존재
- `COMMON-409`: 계정 상태 충돌(잠금 등, 확장 시)

### 3.2 로그아웃
- `POST /api/auth/logout`

Response `204 No Content`

오류 코드
- `401 Unauthorized`

### 3.3 내 정보 조회
- `GET /api/auth/me`

Response `200 OK`
```json
{
  "studentId": 1,
  "studentNumber": "20230001",
  "name": "홍길동",
  "role": "STUDENT",
  "maxCredit": 18
}
```

오류 코드
- `401 Unauthorized`
- `403 Forbidden`

### 3.4 학기 목록 조회
- `GET /api/semesters?activeOnly=true`

Query Parameters
- `activeOnly` (선택, 기본 `false`, `true`면 현재일 기준 진행/신청 가능 학기만 조회)

Response `200 OK`
```json
{
  "items": [
    {
      "semesterId": 1,
      "name": "2026-1",
      "startDate": "2026-03-02",
      "endDate": "2026-06-20",
      "enrollStartAt": "2026-02-20T10:00:00",
      "enrollEndAt": "2026-03-08T23:59:59"
    }
  ]
}
```

오류 코드
- `COMMON-400`

### 3.5 강의 목록 조회
- `GET /api/sections?semesterId=1&keyword=자료구조&dayOfWeek=MON&page=0&size=20`

Query Parameters
- `semesterId` (필수, Long)
- `keyword` (선택, 과목명/과목코드 검색)
- `dayOfWeek` (선택, `MON|TUE|WED|THU|FRI|SAT|SUN`)
- `page` (선택, 기본 0)
- `size` (선택, 기본 20, 최대 100)

Response `200 OK`
```json
{
  "content": [
    {
      "sectionId": 1,
      "semesterId": 1,
      "semesterName": "2026-1",
      "courseId": 10,
      "courseCode": "CSE201",
      "courseName": "자료구조",
      "credit": 3,
      "department": "컴퓨터공학과",
      "sectionNo": "01",
      "professorName": "김교수",
      "classroom": "공학관 101",
      "dayOfWeek": "MON",
      "startPeriod": 3,
      "endPeriod": 4,
      "capacity": 40,
      "currentCount": 27,
      "remainingCount": 13
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

오류 코드
- `COMMON-400`
- `COMMON-404` (`semesterId` 대상 없음)

### 3.6 강의 상세
- `GET /api/sections/{sectionId}`

Path Parameters
- `sectionId` (필수, Long)

Response `200 OK`
```json
{
  "sectionId": 1,
  "semesterId": 1,
  "semesterName": "2026-1",
  "course": {
    "courseId": 10,
    "code": "CSE201",
    "name": "자료구조",
    "credit": 3,
    "department": "컴퓨터공학과"
  },
  "sectionNo": "01",
  "professorName": "김교수",
  "classroom": "공학관 101",
  "dayOfWeek": "MON",
  "startPeriod": 3,
  "endPeriod": 4,
  "capacity": 40,
  "currentCount": 27,
  "remainingCount": 13
}
```

오류 코드
- `COURSE-404`

### 3.7 수강신청
- `POST /api/enrollments`

Request Body
```json
{
  "sectionId": 1
}
```

Response `201 Created`
```json
{
  "enrollmentId": 101,
  "studentId": 1,
  "sectionId": 1,
  "enrolledAt": "2026-03-02T10:45:00"
}
```

오류 코드
- `COMMON-400`
- `COURSE-404`
- `COURSE-409` (정원 초과)
- `COURSE-410` (신청 기간 외)
- `REG-409` (중복 신청)

### 3.8 수강취소
- `DELETE /api/enrollments/{enrollmentId}`

Path Parameters
- `enrollmentId` (필수, Long)

Response `204 No Content`

오류 코드
- `REG-404`
- `REG-410` (취소 불가 기간/상태)

### 3.9 내 신청내역 조회
- `GET /api/enrollments/my?semesterId=1`

Query Parameters
- `semesterId` (선택, 미입력 시 전체 학기)

Response `200 OK`
```json
{
  "studentId": 1,
  "maxCredit": 18,
  "appliedCredit": 6,
  "remainingCredit": 12,
  "items": [
    {
      "enrollmentId": 101,
      "sectionId": 1,
      "semesterId": 1,
      "semesterName": "2026-1",
      "courseCode": "CSE201",
      "courseName": "자료구조",
      "credit": 3,
      "sectionNo": "01",
      "professorName": "김교수",
      "dayOfWeek": "MON",
      "startPeriod": 3,
      "endPeriod": 4,
      "enrolledAt": "2026-03-02T10:45:00"
    }
  ]
}
```

오류 코드
- `COMMON-400`

## 4. 관리자 API

관리자 API는 관리자 권한 세션이 필요하다.

### 4.1 학기 목록 조회
- `GET /api/admin/semesters?page=0&size=20`

Query Parameters
- `page` (선택, 기본 0)
- `size` (선택, 기본 20, 최대 100)

Response `200 OK`
```json
{
  "content": [
    {
      "semesterId": 1,
      "name": "2026-1",
      "startDate": "2026-03-02",
      "endDate": "2026-06-20",
      "enrollStartAt": "2026-02-20T10:00:00",
      "enrollEndAt": "2026-03-08T23:59:59"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

오류 코드
- `COMMON-400`
- `403 Forbidden`

### 4.2 학기 생성
- `POST /api/admin/semesters`

Request Body
```json
{
  "name": "2026-1",
  "startDate": "2026-03-02",
  "endDate": "2026-06-20",
  "enrollStartAt": "2026-02-20T10:00:00",
  "enrollEndAt": "2026-03-08T23:59:59"
}
```

Response `201 Created`
```json
{
  "semesterId": 1,
  "name": "2026-1"
}
```

오류 코드
- `COMMON-400`
- `COMMON-409` (학기명 중복)

### 4.3 강의 목록 조회
- `GET /api/admin/courses?keyword=자료&page=0&size=20`

Query Parameters
- `keyword` (선택, 과목명/과목코드/학과명 검색)
- `page` (선택, 기본 0)
- `size` (선택, 기본 20, 최대 100)

Response `200 OK`
```json
{
  "content": [
    {
      "courseId": 10,
      "code": "CSE201",
      "name": "자료구조",
      "credit": 3,
      "department": "컴퓨터공학과"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

오류 코드
- `COMMON-400`
- `403 Forbidden`

### 4.4 강의 등록
- `POST /api/admin/courses`

Request Body
```json
{
  "code": "CSE201",
  "name": "자료구조",
  "credit": 3,
  "department": "컴퓨터공학과"
}
```

Response `201 Created`
```json
{
  "courseId": 10,
  "code": "CSE201"
}
```

오류 코드
- `COMMON-400`
- `COMMON-409` (과목코드 중복)

### 4.5 분반 생성
- `POST /api/admin/sections`

Request Body
```json
{
  "semesterId": 1,
  "courseId": 10,
  "sectionNo": "01",
  "professorName": "김교수",
  "classroom": "공학관 101",
  "dayOfWeek": "MON",
  "startPeriod": 3,
  "endPeriod": 4,
  "capacity": 40
}
```

Response `201 Created`
```json
{
  "sectionId": 1,
  "semesterId": 1,
  "courseId": 10,
  "sectionNo": "01"
}
```

오류 코드
- `COMMON-400`
- `COURSE-404` (과목/분반 대상 없음)
- `COMMON-409` (동일 학기+과목+분반번호 중복)

### 4.6 신청 현황 조회
- `GET /api/admin/sections/{sectionId}/enrollments`

Path Parameters
- `sectionId` (필수, Long)

Response `200 OK`
```json
{
  "sectionId": 1,
  "courseCode": "CSE201",
  "courseName": "자료구조",
  "sectionNo": "01",
  "capacity": 40,
  "currentCount": 27,
  "enrollments": [
    {
      "enrollmentId": 101,
      "studentId": 1,
      "studentNumber": "20230001",
      "studentName": "홍길동",
      "enrolledAt": "2026-03-02T10:45:00"
    }
  ]
}
```

오류 코드
- `COURSE-404`

## 5. 인증/권한 오류 규약
- 인증 없음: `401 Unauthorized`
- 권한 없음: `403 Forbidden`
- 응답 본문 형식은 `ApiErrorResponse`를 따른다.

## 6. 에러 코드 요약
- `COMMON-400` 잘못된 요청
- `COMMON-404` 리소스 없음
- `COMMON-405` 허용되지 않은 메서드
- `COMMON-409` 상태 충돌
- `COMMON-500` 서버 오류
- `COURSE-404` 강의/분반 대상 없음
- `COURSE-409` 정원 초과
- `COURSE-410` 신청 기간 외
- `REG-404` 신청 정보 없음
- `REG-409` 중복 신청
- `REG-410` 취소 불가 상태
