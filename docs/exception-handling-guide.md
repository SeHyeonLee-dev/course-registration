# Exception Handling Guide

## 1) 컨트롤러/서비스에서 예외를 던지는 방식

서비스에서 비즈니스 예외를 던집니다.

```java
throw new BusinessException(ErrorCode.NOT_FOUND, "수강 신청 정보를 찾을 수 없습니다.");
```

컨트롤러에서는 `try-catch`로 감싸지 않고 그대로 전파합니다.

```java
@GetMapping("/registrations/{id}")
public RegistrationResponse get(@PathVariable Long id) {
    return registrationService.getById(id); // 내부에서 BusinessException 발생 가능
}
```

입력값 검증은 DTO + `@Valid`를 사용합니다.

```java
@PostMapping("/registrations")
public RegistrationResponse create(@Valid @RequestBody RegistrationCreateRequest request) {
    return registrationService.create(request);
}
```

## 2) 응답 형태 통일 규칙

오류 응답은 `ApiErrorResponse`로 통일합니다.

```json
{
  "code": "COMMON-404",
  "message": "요청한 리소스를 찾을 수 없습니다.",
  "status": 404,
  "path": "/api/registrations/10",
  "timestamp": "2026-02-27T23:55:00.123",
  "fieldErrors": {
    "studentId": "학생 ID는 필수입니다."
  }
}
```

필드 설명:

- `code`: 클라이언트 분기용 내부 에러 코드
- `message`: 사용자/개발자에게 보여줄 메시지
- `status`: HTTP 상태 코드
- `path`: 요청 경로
- `timestamp`: 서버 에러 발생 시각
- `fieldErrors`: 검증 실패 시 필드별 메시지 (`MethodArgumentNotValidException`일 때만 포함)

## 3) 에러 코드 운영 규칙

- 공통 예외는 `ErrorCode`에 정의 후 재사용
- 도메인별 상세 코드가 필요하면 `ErrorCode`에 추가
- 예외 메시지는 기본 메시지 사용을 원칙으로 하고, 필요할 때만 override

## 4) 예외 처리 매핑 표

| 발생 위치/메서드 | 던지는 예외 | 처리 핸들러 | HTTP Status | code | message 규칙 |
|---|---|---|---|---|---|
| 서비스 로직 (`throw new BusinessException(...)`) | `BusinessException` | `handleBusinessException` | `ErrorCode.status` | `ErrorCode.code` | 예외 생성 시 전달한 메시지(없으면 `ErrorCode.message`) |
| 컨트롤러 `@Valid @RequestBody` 검증 실패 | `MethodArgumentNotValidException` | `handleValidationException` | `400` | `COMMON-400` | 고정 메시지 + `fieldErrors` 포함 |
| 파라미터 타입 불일치 (`@PathVariable Long`에 문자열 등) | `MethodArgumentTypeMismatchException` | `handleBadRequest` | `400` | `COMMON-400` | 고정 메시지(`잘못된 요청입니다.`) |
| 서비스/컨트롤러에서 잘못된 인자 전달 | `IllegalArgumentException` | `handleBadRequest` | `400` | `COMMON-400` | 고정 메시지(`잘못된 요청입니다.`) |
| 지원하지 않는 HTTP 메서드 호출 | `HttpRequestMethodNotSupportedException` | `handleMethodNotAllowed` | `405` | `COMMON-405` | 고정 메시지(`허용되지 않은 HTTP 메서드입니다.`) |
| 위에서 처리되지 않은 모든 예외 | `Exception` | `handleUnexpectedException` | `500` | `COMMON-500` | 고정 메시지(`서버 내부 오류가 발생했습니다.`) |

### BusinessException에서 선택 가능한 기본 ErrorCode

| 서비스에서 선택한 `ErrorCode` | HTTP Status | code | 기본 message |
|---|---|---|---|
| `INVALID_INPUT` | `400` | `COMMON-400` | 잘못된 요청입니다. |
| `NOT_FOUND` | `404` | `COMMON-404` | 요청한 리소스를 찾을 수 없습니다. |
| `CONFLICT` | `409` | `COMMON-409` | 요청이 현재 상태와 충돌합니다. |
| `METHOD_NOT_ALLOWED` | `405` | `COMMON-405` | 허용되지 않은 HTTP 메서드입니다. |
| `INTERNAL_SERVER_ERROR` | `500` | `COMMON-500` | 서버 내부 오류가 발생했습니다. |

## 5) 도메인별 ErrorCode 확장 표

### COURSE 도메인

| `ErrorCode` | HTTP Status | code | 기본 message | 권장 발생 지점 |
|---|---|---|---|---|
| `COURSE_NOT_FOUND` | `404` | `COURSE-404` | 강의를 찾을 수 없습니다. | 강의 조회/수정/삭제 시 대상 없음 |
| `COURSE_CAPACITY_EXCEEDED` | `409` | `COURSE-409` | 강의 정원이 초과되었습니다. | 수강 신청 시 정원 초과 |
| `COURSE_CLOSED` | `409` | `COURSE-410` | 수강 신청 기간이 아닙니다. | 신청 기간 외 요청 |

### REG 도메인

| `ErrorCode` | HTTP Status | code | 기본 message | 권장 발생 지점 |
|---|---|---|---|---|
| `REG_NOT_FOUND` | `404` | `REG-404` | 수강 신청 정보를 찾을 수 없습니다. | 신청 조회/취소 시 대상 없음 |
| `REG_ALREADY_REGISTERED` | `409` | `REG-409` | 이미 신청한 강의입니다. | 중복 신청 시도 |
| `REG_CANNOT_CANCEL` | `409` | `REG-410` | 현재 상태에서는 수강 취소할 수 없습니다. | 취소 불가 상태 요청 |

### 서비스 사용 예시

```java
if (course == null) {
    throw new BusinessException(ErrorCode.COURSE_NOT_FOUND);
}

if (registrationExists) {
    throw new BusinessException(ErrorCode.REG_ALREADY_REGISTERED);
}
```
