# Postman 테스트 가이드 (현재 구현 API)

현재 구현된 API:
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## 1) 서버 실행
프로젝트 루트에서 실행:

```bash
./gradlew bootRun
```

기본 주소는 `http://localhost:8080`.

## 2) 테스트 데이터 준비 (MySQL)
로그인할 학생이 DB에 없으면 아래 SQL을 1회 실행:

```sql
INSERT INTO student (student_number, name, password_hash, max_credit)
VALUES ('20230001', '홍길동', 'password123', 18);
```

이미 있으면 비밀번호만 맞춰도 됨:

```sql
UPDATE student
SET password_hash = 'password123'
WHERE student_number = '20230001';
```

## 3) Postman Import
다음 파일 2개를 Postman에 Import:
- `docs/postman/registration-auth.postman_collection.json`
- `docs/postman/registration-local.postman_environment.json`

그리고 Environment를 `registration-local`로 선택.

## 4) 실행 순서
아래 순서대로 실행:
1. `1) Login` (기대: `200`)
2. `2) Me (After Login)` (기대: `200`)
3. `3) Logout` (기대: `204`)
4. `4) Me (After Logout, should be 401)` (기대: `401`, `COMMON-401`)

## 5) 자주 발생하는 문제
- `404` 로그인 실패: 해당 `studentNumber`가 DB에 없음
- `400` 로그인 실패: 비밀번호 불일치
- `401` me 실패: 로그인 요청 후 같은 Postman 세션/쿠키 jar를 사용하지 않았음
