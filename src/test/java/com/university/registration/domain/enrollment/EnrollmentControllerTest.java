package com.university.registration.domain.enrollment;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.university.registration.domain.auth.AuthSessionKeys;
import com.university.registration.domain.enrollment.dto.EnrollmentApplyResponse;
import com.university.registration.domain.enrollment.dto.MyEnrollmentItemResponse;
import com.university.registration.domain.enrollment.dto.MyEnrollmentResponse;
import com.university.registration.domain.enrollment.dto.MyTimetableItemResponse;
import com.university.registration.domain.student.repository.StudentRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(EnrollmentController.class)
@AutoConfigureMockMvc(addFilters = false)
class EnrollmentControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private EnrollmentService enrollmentService;
  @MockitoBean private StudentRepository studentRepository;

  @Test
  void applyReturnsCreatedResponse() throws Exception {
    MockHttpSession session = session(1L);
    EnrollmentApplyResponse response =
        new EnrollmentApplyResponse(101L, 1L, 1L, LocalDateTime.of(2026, 3, 10, 9, 0));

    when(enrollmentService.apply(any(), any())).thenReturn(response);

    mockMvc
        .perform(
            post("/api/enrollments")
                .session(session)
                .contentType("application/json")
                .content(
                    """
                    {
                      "sectionId": 1
                    }
                    """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.enrollmentId").value(101))
        .andExpect(jsonPath("$.studentId").value(1))
        .andExpect(jsonPath("$.sectionId").value(1))
        .andExpect(jsonPath("$.enrolledAt").value("2026-03-10T09:00:00"));
  }

  @Test
  void applyFailsWhenSectionIdMissing() throws Exception {
    mockMvc
        .perform(
            post("/api/enrollments")
                .contentType("application/json")
                .content(
                    """
                    {
                    }
                    """))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("COMMON-400"));
  }

  @Test
  void cancelReturnsNoContent() throws Exception {
    MockHttpSession session = session(1L);

    mockMvc.perform(delete("/api/enrollments/101").session(session)).andExpect(status().isNoContent());

    verify(enrollmentService).cancel(101L, session);
  }

  @Test
  void getMyEnrollmentsReturnsEnrollmentSummary() throws Exception {
    MockHttpSession session = session(1L);
    MyEnrollmentItemResponse item =
        new MyEnrollmentItemResponse(
            101L,
            1L,
            1L,
            "2026-1",
            "CSE201",
            "자료구조",
            3,
            "01",
            "김교수",
            "MON",
            3,
            4,
            LocalDateTime.of(2026, 3, 10, 9, 0));
    MyTimetableItemResponse timetableItem =
        new MyTimetableItemResponse(101L, 1L, "CSE201", "자료구조", "01", "김교수", 3, 4);
    MyEnrollmentResponse response =
        new MyEnrollmentResponse(
            1L,
            18,
            3,
            15,
            List.of(item),
            Map.of(
                "MON", List.of(timetableItem),
                "TUE", List.of(),
                "WED", List.of(),
                "THU", List.of(),
                "FRI", List.of(),
                "SAT", List.of(),
                "SUN", List.of()));

    when(enrollmentService.getMyEnrollments(eq(1L), any())).thenReturn(response);

    mockMvc
        .perform(get("/api/enrollments/my").session(session).param("semesterId", "1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.studentId").value(1))
        .andExpect(jsonPath("$.appliedCredit").value(3))
        .andExpect(jsonPath("$.remainingCredit").value(15))
        .andExpect(jsonPath("$.items[0].courseCode").value("CSE201"))
        .andExpect(jsonPath("$.timetable.MON[0].courseName").value("자료구조"));
  }

  private MockHttpSession session(Long studentId) {
    MockHttpSession session = new MockHttpSession();
    session.setAttribute(AuthSessionKeys.LOGIN_STUDENT_ID, studentId);
    return session;
  }
}
