package com.university.registration.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
  // Common
  INVALID_INPUT(HttpStatus.BAD_REQUEST, "COMMON-400", "잘못된 요청입니다."),
  UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "COMMON-401", "인증이 필요합니다."),
  METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "COMMON-405", "허용되지 않은 HTTP 메서드입니다."),
  NOT_FOUND(HttpStatus.NOT_FOUND, "COMMON-404", "요청한 리소스를 찾을 수 없습니다."),
  CONFLICT(HttpStatus.CONFLICT, "COMMON-409", "요청이 현재 상태와 충돌합니다."),
  INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "COMMON-500", "서버 내부 오류가 발생했습니다."),

  // Course Domain
  COURSE_NOT_FOUND(HttpStatus.NOT_FOUND, "COURSE-404", "강의를 찾을 수 없습니다."),
  COURSE_CAPACITY_EXCEEDED(HttpStatus.CONFLICT, "COURSE-409", "강의 정원이 초과되었습니다."),
  COURSE_CLOSED(HttpStatus.CONFLICT, "COURSE-410", "수강 신청 기간이 아닙니다."),

  // Registration Domain
  REG_NOT_FOUND(HttpStatus.NOT_FOUND, "REG-404", "수강 신청 정보를 찾을 수 없습니다."),
  REG_ALREADY_REGISTERED(HttpStatus.CONFLICT, "REG-409", "이미 신청한 강의입니다."),
  REG_CANNOT_CANCEL(HttpStatus.CONFLICT, "REG-410", "현재 상태에서는 수강 취소할 수 없습니다.");

  private final HttpStatus status;
  private final String code;
  private final String message;

  ErrorCode(HttpStatus status, String code, String message) {
    this.status = status;
    this.code = code;
    this.message = message;
  }
}
