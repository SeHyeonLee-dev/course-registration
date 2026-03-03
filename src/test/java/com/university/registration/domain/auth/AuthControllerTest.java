package com.university.registration.domain.auth;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.university.registration.domain.student.Student;
import com.university.registration.domain.student.repository.StudentRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(AuthController.class)
@Import(AuthService.class)
class AuthControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private StudentRepository studentRepository;

  @Test
  void loginSuccessSetsSessionAndReturnsStudentInfo() throws Exception {
    Student student = student(1L, "20230001", "홍길동", "password123", 18);
    when(studentRepository.findByStudentNumber("20230001")).thenReturn(Optional.of(student));

    MvcResult result =
        mockMvc
            .perform(
                post("/api/auth/login")
                    .contentType("application/json")
                    .content(
                        """
                        {
                          "studentNumber": "20230001",
                          "password": "password123"
                        }
                        """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.studentId").value(1))
            .andExpect(jsonPath("$.studentNumber").value("20230001"))
            .andExpect(jsonPath("$.name").value("홍길동"))
            .andExpect(jsonPath("$.maxCredit").value(18))
            .andReturn();

    MockHttpSession session = (MockHttpSession) result.getRequest().getSession(false);
    org.assertj.core.api.Assertions.assertThat(session).isNotNull();
    org.assertj.core.api.Assertions.assertThat(session.getAttribute(AuthSessionKeys.LOGIN_STUDENT_ID))
        .isEqualTo(1L);
  }

  @Test
  void loginFailsWhenStudentNotFound() throws Exception {
    when(studentRepository.findByStudentNumber(anyString())).thenReturn(Optional.empty());

    mockMvc
        .perform(
            post("/api/auth/login")
                .contentType("application/json")
                .content(
                    """
                    {
                      "studentNumber": "20239999",
                      "password": "password123"
                    }
                    """))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("COMMON-404"));
  }

  @Test
  void loginFailsWhenPasswordMismatched() throws Exception {
    Student student = student(1L, "20230001", "홍길동", "password123", 18);
    when(studentRepository.findByStudentNumber("20230001")).thenReturn(Optional.of(student));

    mockMvc
        .perform(
            post("/api/auth/login")
                .contentType("application/json")
                .content(
                    """
                    {
                      "studentNumber": "20230001",
                      "password": "wrong-password"
                    }
                    """))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("COMMON-400"));
  }

  @Test
  void logoutInvalidatesSession() throws Exception {
    MockHttpSession session = new MockHttpSession();
    session.setAttribute(AuthSessionKeys.LOGIN_STUDENT_ID, 1L);

    mockMvc.perform(post("/api/auth/logout").session(session)).andExpect(status().isNoContent());

    org.assertj.core.api.Assertions.assertThat(session.isInvalid()).isTrue();
  }

  @Test
  void meReturnsCurrentStudent() throws Exception {
    Student student = student(1L, "20230001", "홍길동", "password123", 18);
    when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

    MockHttpSession session = new MockHttpSession();
    session.setAttribute(AuthSessionKeys.LOGIN_STUDENT_ID, 1L);

    mockMvc
        .perform(get("/api/auth/me").session(session))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.studentId").value(1))
        .andExpect(jsonPath("$.studentNumber").value("20230001"))
        .andExpect(jsonPath("$.name").value("홍길동"))
        .andExpect(jsonPath("$.role").value("STUDENT"))
        .andExpect(jsonPath("$.maxCredit").value(18));
  }

  @Test
  void meFailsWhenUnauthenticated() throws Exception {
    mockMvc
        .perform(get("/api/auth/me"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.code").value("COMMON-401"));
  }

  private Student student(
      Long id, String studentNumber, String name, String passwordHash, Integer maxCredit) {
    Student student = new Student(studentNumber, name, passwordHash, maxCredit);
    ReflectionTestUtils.setField(student, "id", id);
    return student;
  }
}
