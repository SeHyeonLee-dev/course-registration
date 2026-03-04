package com.university.registration.global.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.university.registration.global.api.ApiErrorResponse;
import com.university.registration.global.exception.ErrorCode;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RestAccessDeniedHandler implements AccessDeniedHandler {
  private final ObjectMapper objectMapper;

  @Override
  public void handle(
      HttpServletRequest request,
      HttpServletResponse response,
      AccessDeniedException accessDeniedException)
      throws IOException, ServletException {
    ErrorCode errorCode = ErrorCode.FORBIDDEN;
    ApiErrorResponse body =
        ApiErrorResponse.of(
            errorCode.getCode(),
            errorCode.getMessage(),
            errorCode.getStatus().value(),
            request.getRequestURI());

    response.setStatus(errorCode.getStatus().value());
    response.setCharacterEncoding("UTF-8");
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.getWriter().write(objectMapper.writeValueAsString(body));
  }
}
