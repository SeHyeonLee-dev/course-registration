package com.university.registration.global.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiErrorResponse(
    String code,
    String message,
    int status,
    String path,
    LocalDateTime timestamp,
    Map<String, String> fieldErrors) {
  public static ApiErrorResponse of(String code, String message, int status, String path) {
    return new ApiErrorResponse(code, message, status, path, LocalDateTime.now(), null);
  }

  public static ApiErrorResponse of(
      String code, String message, int status, String path, Map<String, String> fieldErrors) {
    return new ApiErrorResponse(code, message, status, path, LocalDateTime.now(), fieldErrors);
  }
}
