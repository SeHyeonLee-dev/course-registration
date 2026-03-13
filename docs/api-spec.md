# 수강신청 시스템 API 명세서

## 1. 개요
- Base URL: `/api`
- Content-Type: `application/json; charset=utf-8`
- 인증 방식: 세션 기반 로그인(`JSESSIONID` 쿠키)
- 시간 포맷
  - `LocalDate`: `yyyy-MM-dd`
  - `LocalDateTime`: `yyyy-MM-dd'T'HH:mm:ss`

## 2. 공통 규약

### 2.1 인증/권한
- `POST /api/auth/login`만 비인증 접근 가능
- `/api/admin/**`는 `ROLE_ADMIN` 세션 필요
- 그 외 `/api/**`는 `ROLE_STUDENT` 또는 `ROLE_ADMIN` 세션 필요

### 2.2 성공 응답
- 조회 성공: `200 OK`
- 생성 성공: `201 Created`
- 삭제 성공: `204 No Content`

### 2.3 오류 응답
오류 발생 시 아래 형식을 사용한다.

```json
{
  "code": "COMMON-400",
  "message": "잘못된 요청입니다.",
  "status": 400,
  "path": "/api/enrollments",
  "timestamp": "2026-03-10T09:00:00",
  "fieldErrors": {
    "sectionId": "sectionId는 필수입니다."
  }
}
```

- `fieldErrors`는 Bean Validation 실패 시에만 포함된다.
- 인증/권한 오류도 동일한 `ApiErrorResponse` 형식을 사용한다.

## 3. 학생 API

### 3.1 로그인
- `POST /api/auth/login`

Request Body
```json
{
  "studentNumber": "20230001",
  "password": "password123"
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
- `COMMON-400`: 요청 형식 오류, 비밀번호 불일치
- `COMMON-404`: 존재하지 않는 학번

### 3.2 로그아웃
- `POST /api/auth/logout`

Response `204 No Content`

오류 코드
- `COMMON-401`

### 3.3 내 정보 조회
- `GET /api/auth/me`

Response `200 OK`
```json
{
  "studentId": 1,
  "studentNumber": "20230001",
  "name": "홍길동",
  "role": "ROLE_STUDENT",
  "maxCredit": 18
}
```

- 관리자 계정은 `role` 값이 `ROLE_ADMIN`으로 내려간다.

오류 코드
- `COMMON-401`
- `COMMON-404`: 세션의 사용자 정보가 더 이상 존재하지 않음

### 3.4 학기 목록 조회
- `GET /api/semesters?activeOnly=true`

Query Parameters
- `activeOnly` (선택, 기본 `false`)
  - `true`: 현재 시각이 `enrollStartAt` 이상 `endDate` 이하인 학기만 조회
  - `false`: 전체 학기 조회

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

### 3.5 강의 목록 조회
- `GET /api/sections?semesterId=1&keyword=자료구조&dayOfWeek=MON&page=0&size=20`

Query Parameters
- `semesterId` (필수, Long)
- `keyword` (선택, 과목명/과목코드 검색)
- `dayOfWeek` (선택, `MON|TUE|WED|THU|FRI|SAT|SUN`)
- `page` (선택, 기본 0, 최소 0)
- `size` (선택, 기본 20, 최소 1, 최대 100)

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
- `COMMON-400`: 잘못된 요일, 페이지/사이즈 범위 오류
- `COMMON-404`: 존재하지 않는 학기

### 3.6 강의 상세 조회
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
  "enrolledAt": "2026-03-10T09:00:00"
}
```

오류 코드
- `COMMON-400`: 요청 형식 오류
- `COMMON-401`: 미인증
- `COMMON-404`: 세션 사용자가 존재하지 않음
- `COMMON-409`: 시간표 충돌, 최대 학점 초과
- `COURSE-404`: 분반 없음
- `COURSE-409`: 정원 초과
- `COURSE-410`: 수강신청 기간 아님
- `REG-409`: 동일 분반 또는 동일 학기 동일 과목 중복 신청

### 3.8 수강취소
- `DELETE /api/enrollments/{enrollmentId}`

Path Parameters
- `enrollmentId` (필수, Long)

Response `204 No Content`

오류 코드
- `COMMON-401`: 미인증
- `COURSE-404`: 연결된 분반 정보 없음
- `REG-404`: 신청 내역이 없거나 본인 신청 내역이 아님
- `REG-410`: 취소 가능 기간 아님

### 3.9 내 신청내역 조회
- `GET /api/enrollments/my?semesterId=1`

Query Parameters
- `semesterId` (선택)
  - 미입력 시 전체 학기 조회
  - 입력 시 해당 학기 신청 내역만 조회

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
      "enrolledAt": "2026-03-10T09:00:00"
    }
  ],
  "timetable": {
    "MON": [
      {
        "enrollmentId": 101,
        "sectionId": 1,
        "courseCode": "CSE201",
        "courseName": "자료구조",
        "sectionNo": "01",
        "professorName": "김교수",
        "startPeriod": 3,
        "endPeriod": 4
      }
    ],
    "TUE": [],
    "WED": [],
    "THU": [],
    "FRI": [],
    "SAT": [],
    "SUN": []
  }
}
```

오류 코드
- `COMMON-400`: 유효하지 않은 `semesterId`
- `COMMON-401`: 미인증
- `COMMON-404`: 세션 사용자가 존재하지 않음

## 4. 관리자 API

관리자 API는 `ROLE_ADMIN` 세션이 필요하다.

### 4.1 학기 생성
- `POST /api/admin/semesters`

Request Body
```json
{
  "name": "2026-2",
  "startDate": "2026-09-01",
  "endDate": "2026-12-20",
  "enrollStartAt": "2026-08-25T09:00:00",
  "enrollEndAt": "2026-08-29T18:00:00"
}
```

Response `201 Created`
```json
{
  "semesterId": 1,
  "name": "2026-2",
  "startDate": "2026-09-01",
  "endDate": "2026-12-20",
  "enrollStartAt": "2026-08-25T09:00:00",
  "enrollEndAt": "2026-08-29T18:00:00"
}
```

오류 코드
- `COMMON-400`: 요청 형식 오류, 학기/신청 기간 규칙 위반
- `COMMON-409`: 학기명 중복
- `COMMON-401`
- `COMMON-403`

### 4.2 수강신청 기간 수정
- `PUT /api/admin/semesters/{semesterId}/enrollment-period`

Path Parameters
- `semesterId` (필수, Long)

Request Body
```json
{
  "enrollStartAt": "2026-02-20T09:00:00",
  "enrollEndAt": "2026-02-28T18:00:00"
}
```

Response `200 OK`
```json
{
  "semesterId": 1,
  "name": "2026-1",
  "startDate": "2026-03-02",
  "endDate": "2026-06-20",
  "enrollStartAt": "2026-02-20T09:00:00",
  "enrollEndAt": "2026-02-28T18:00:00"
}
```

오류 코드
- `COMMON-400`: 요청 형식 오류, 신청 기간 규칙 위반
- `COMMON-404`: 학기 없음
- `COMMON-401`
- `COMMON-403`

### 4.3 강의 등록
- `POST /api/admin/courses`

Request Body
```json
{
  "code": "CSE401",
  "name": "운영체제",
  "credit": 3,
  "department": "컴퓨터공학과"
}
```

Response `201 Created`
```json
{
  "courseId": 10,
  "code": "CSE401",
  "name": "운영체제",
  "credit": 3,
  "department": "컴퓨터공학과"
}
```

오류 코드
- `COMMON-400`: 요청 형식 오류
- `COMMON-409`: 강의 코드 중복
- `COMMON-401`
- `COMMON-403`

### 4.4 분반 생성
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
  "startPeriod": 1,
  "endPeriod": 3,
  "capacity": 40
}
```

Response `201 Created`
```json
{
  "sectionId": 100,
  "semesterId": 1,
  "semesterName": "2026-1",
  "courseId": 10,
  "courseCode": "CSE401",
  "courseName": "운영체제",
  "sectionNo": "01",
  "professorName": "김교수",
  "classroom": "공학관 101",
  "dayOfWeek": "MON",
  "startPeriod": 1,
  "endPeriod": 3,
  "capacity": 40,
  "currentCount": 0
}
```

오류 코드
- `COMMON-400`: 요청 형식 오류, 시작/종료 교시 범위 오류
- `COMMON-404`: 학기 없음
- `COMMON-409`: 동일 학기/강의의 분반 번호 중복
- `COURSE-404`: 강의 없음
- `COMMON-401`
- `COMMON-403`

### 4.5 신청 현황 조회
- `GET /api/admin/sections/{sectionId}/enrollments`

Path Parameters
- `sectionId` (필수, Long)

Response `200 OK`
```json
{
  "sectionId": 100,
  "semesterId": 1,
  "semesterName": "2026-1",
  "courseId": 10,
  "courseCode": "CSE401",
  "courseName": "운영체제",
  "sectionNo": "01",
  "professorName": "김교수",
  "dayOfWeek": "MON",
  "startPeriod": 1,
  "endPeriod": 3,
  "capacity": 40,
  "currentCount": 2,
  "remainingCount": 38,
  "enrollments": [
    {
      "enrollmentId": 101,
      "studentId": 1,
      "studentNumber": "20230001",
      "studentName": "홍길동",
      "enrolledAt": "2026-03-10T10:00:00"
    }
  ]
}
```

오류 코드
- `COURSE-404`
- `COMMON-401`
- `COMMON-403`

## 5. 에러 코드 요약
- `COMMON-400` 잘못된 요청
- `COMMON-401` 인증 필요
- `COMMON-403` 접근 권한 없음
- `COMMON-404` 리소스 없음
- `COMMON-405` 허용되지 않은 메서드
- `COMMON-409` 상태 충돌
- `COMMON-500` 서버 오류
- `COURSE-404` 강의 또는 분반 없음
- `COURSE-409` 강의 정원 초과
- `COURSE-410` 수강신청 기간 아님
- `REG-404` 수강 신청 정보 없음
- `REG-409` 중복 신청
- `REG-410` 취소 가능 기간 아님
