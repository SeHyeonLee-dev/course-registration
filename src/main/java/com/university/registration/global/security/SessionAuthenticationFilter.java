package com.university.registration.global.security;

import com.university.registration.domain.auth.AuthSessionKeys;
import com.university.registration.domain.student.Student;
import com.university.registration.domain.student.repository.StudentRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class SessionAuthenticationFilter extends OncePerRequestFilter {
  private final StudentRepository studentRepository;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    if (SecurityContextHolder.getContext().getAuthentication() != null) {
      filterChain.doFilter(request, response);
      return;
    }

    HttpSession session = request.getSession(false);
    if (session == null) {
      filterChain.doFilter(request, response);
      return;
    }

    Object loginStudentId = session.getAttribute(AuthSessionKeys.LOGIN_STUDENT_ID);
    if (!(loginStudentId instanceof Long studentId)) {
      filterChain.doFilter(request, response);
      return;
    }

    studentRepository
        .findById(studentId)
        .ifPresent(student -> setAuthentication(student, request));

    filterChain.doFilter(request, response);
  }

  private void setAuthentication(Student student, HttpServletRequest request) {
    UsernamePasswordAuthenticationToken authentication =
        new UsernamePasswordAuthenticationToken(
            student.getStudentNumber(),
            null,
            List.of(new SimpleGrantedAuthority("ROLE_" + student.getRole().name())));
    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
    SecurityContextHolder.getContext().setAuthentication(authentication);
  }
}
