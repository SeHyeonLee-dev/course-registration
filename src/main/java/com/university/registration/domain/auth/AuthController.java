package com.university.registration.domain.auth;

import com.university.registration.domain.auth.dto.LoginRequest;
import com.university.registration.domain.auth.dto.LoginResponse;
import com.university.registration.domain.auth.dto.MeResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService authService;

  @PostMapping("/login")
  public LoginResponse login(
      @Valid @RequestBody LoginRequest request, HttpServletRequest httpServletRequest) {
    HttpSession session = httpServletRequest.getSession(true);
    return authService.login(request, session);
  }

  @PostMapping("/logout")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void logout(HttpServletRequest httpServletRequest) {
    authService.logout(httpServletRequest.getSession(false));
  }

  @GetMapping("/me")
  public MeResponse me(HttpServletRequest httpServletRequest) {
    return authService.me(httpServletRequest.getSession(false));
  }
}
