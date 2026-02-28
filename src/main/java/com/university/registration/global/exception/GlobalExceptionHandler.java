package com.university.registration.global.exception;

import com.university.registration.global.api.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(BusinessException.class)
  public ResponseEntity<ApiErrorResponse> handleBusinessException(
      BusinessException exception, HttpServletRequest request) {
    ErrorCode errorCode = exception.getErrorCode();
    ApiErrorResponse body =
        ApiErrorResponse.of(
            errorCode.getCode(),
            exception.getMessage(),
            errorCode.getStatus().value(),
            request.getRequestURI());
    return ResponseEntity.status(errorCode.getStatus()).body(body);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiErrorResponse> handleValidationException(
      MethodArgumentNotValidException exception, HttpServletRequest request) {
    Map<String, String> fieldErrors = new HashMap<>();
    for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
      fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
    }

    ErrorCode errorCode = ErrorCode.INVALID_INPUT;
    ApiErrorResponse body =
        ApiErrorResponse.of(
            errorCode.getCode(),
            errorCode.getMessage(),
            errorCode.getStatus().value(),
            request.getRequestURI(),
            fieldErrors);
    return ResponseEntity.status(errorCode.getStatus()).body(body);
  }

  @ExceptionHandler({MethodArgumentTypeMismatchException.class, IllegalArgumentException.class})
  public ResponseEntity<ApiErrorResponse> handleBadRequest(
      Exception exception, HttpServletRequest request) {
    ErrorCode errorCode = ErrorCode.INVALID_INPUT;
    ApiErrorResponse body =
        ApiErrorResponse.of(
            errorCode.getCode(),
            errorCode.getMessage(),
            errorCode.getStatus().value(),
            request.getRequestURI());
    return ResponseEntity.status(errorCode.getStatus()).body(body);
  }

  @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
  public ResponseEntity<ApiErrorResponse> handleMethodNotAllowed(
      HttpRequestMethodNotSupportedException exception, HttpServletRequest request) {
    ErrorCode errorCode = ErrorCode.METHOD_NOT_ALLOWED;
    ApiErrorResponse body =
        ApiErrorResponse.of(
            errorCode.getCode(),
            errorCode.getMessage(),
            errorCode.getStatus().value(),
            request.getRequestURI());
    return ResponseEntity.status(errorCode.getStatus()).body(body);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiErrorResponse> handleUnexpectedException(
      Exception exception, HttpServletRequest request) {
    ErrorCode errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
    ApiErrorResponse body =
        ApiErrorResponse.of(
            errorCode.getCode(),
            errorCode.getMessage(),
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            request.getRequestURI());
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
  }
}
