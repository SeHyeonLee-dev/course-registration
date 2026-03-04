package com.university.registration.domain.auth;

import com.university.registration.domain.auth.dto.LoginRequest;
import com.university.registration.domain.auth.dto.LoginResponse;
import com.university.registration.domain.auth.dto.MeResponse;
import com.university.registration.domain.student.Student;
import com.university.registration.domain.student.repository.StudentRepository;
import com.university.registration.global.exception.BusinessException;
import com.university.registration.global.exception.ErrorCode;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
  private final StudentRepository studentRepository;

  @Transactional(readOnly = true)
  public LoginResponse login(LoginRequest request, HttpSession session) {
    Student student =
        studentRepository
            .findByStudentNumber(request.studentNumber())
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "존재하지 않는 학번입니다."));

    if (!isPasswordMatched(request.password(), student.getPasswordHash())) {
      throw new BusinessException(ErrorCode.INVALID_INPUT, "비밀번호가 올바르지 않습니다.");
    }

    session.setAttribute(AuthSessionKeys.LOGIN_STUDENT_ID, student.getId());
    return LoginResponse.from(student);
  }

  public void logout(HttpSession session) {
    if (session == null) {
      return;
    }
    session.invalidate();
  }

  @Transactional(readOnly = true)
  public MeResponse me(HttpSession session) {
    if (session == null) {
      throw new BusinessException(ErrorCode.UNAUTHORIZED);
    }

    Object loginStudentId = session.getAttribute(AuthSessionKeys.LOGIN_STUDENT_ID);
    if (!(loginStudentId instanceof Long studentId)) {
      throw new BusinessException(ErrorCode.UNAUTHORIZED);
    }

    Student student =
        studentRepository
            .findById(studentId)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "사용자 정보를 찾을 수 없습니다."));
    return MeResponse.from(student);
  }

  private boolean isPasswordMatched(String rawPassword, String savedPasswordHash) {
    if (isBcryptHash(savedPasswordHash)) {
      return BCrypt.checkpw(rawPassword, savedPasswordHash);
    }
    return rawPassword.equals(savedPasswordHash);
  }

  private boolean isBcryptHash(String passwordHash) {
    return passwordHash != null
        && (passwordHash.startsWith("$2a$")
            || passwordHash.startsWith("$2b$")
            || passwordHash.startsWith("$2y$"));
  }
}
