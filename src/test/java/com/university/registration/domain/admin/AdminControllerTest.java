package com.university.registration.domain.admin;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.university.registration.domain.admin.dto.AdminCourseResponse;
import com.university.registration.domain.admin.dto.AdminSectionEnrollmentItemResponse;
import com.university.registration.domain.admin.dto.AdminSectionEnrollmentStatusResponse;
import com.university.registration.domain.admin.dto.AdminSectionResponse;
import com.university.registration.domain.admin.dto.AdminSemesterResponse;
import com.university.registration.domain.student.repository.StudentRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AdminController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private AdminService adminService;
  @MockitoBean private StudentRepository studentRepository;

  @Test
  void createSemesterReturnsCreated() throws Exception {
    when(adminService.createSemester(any()))
        .thenReturn(
            new AdminSemesterResponse(
                1L,
                "2026-2",
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2026, 12, 20),
                LocalDateTime.of(2026, 8, 25, 9, 0),
                LocalDateTime.of(2026, 8, 29, 18, 0)));

    mockMvc
        .perform(
            post("/api/admin/semesters")
                .contentType("application/json")
                .content(
                    """
                    {
                      "name": "2026-2",
                      "startDate": "2026-09-01",
                      "endDate": "2026-12-20",
                      "enrollStartAt": "2026-08-25T09:00:00",
                      "enrollEndAt": "2026-08-29T18:00:00"
                    }
                    """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.semesterId").value(1))
        .andExpect(jsonPath("$.name").value("2026-2"));
  }

  @Test
  void updateEnrollmentPeriodReturnsOk() throws Exception {
    when(adminService.updateEnrollmentPeriod(eq(1L), any()))
        .thenReturn(
            new AdminSemesterResponse(
                1L,
                "2026-1",
                LocalDate.of(2026, 3, 2),
                LocalDate.of(2026, 6, 20),
                LocalDateTime.of(2026, 2, 20, 9, 0),
                LocalDateTime.of(2026, 2, 28, 18, 0)));

    mockMvc
        .perform(
            put("/api/admin/semesters/1/enrollment-period")
                .contentType("application/json")
                .content(
                    """
                    {
                      "enrollStartAt": "2026-02-20T09:00:00",
                      "enrollEndAt": "2026-02-28T18:00:00"
                    }
                    """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.semesterId").value(1))
        .andExpect(jsonPath("$.enrollStartAt").value("2026-02-20T09:00:00"));
  }

  @Test
  void createCourseReturnsCreated() throws Exception {
    when(adminService.createCourse(any()))
        .thenReturn(new AdminCourseResponse(10L, "CSE401", "운영체제", 3, "컴퓨터공학과"));

    mockMvc
        .perform(
            post("/api/admin/courses")
                .contentType("application/json")
                .content(
                    """
                    {
                      "code": "CSE401",
                      "name": "운영체제",
                      "credit": 3,
                      "department": "컴퓨터공학과"
                    }
                    """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.courseId").value(10))
        .andExpect(jsonPath("$.code").value("CSE401"));
  }

  @Test
  void createSectionReturnsCreated() throws Exception {
    when(adminService.createSection(any()))
        .thenReturn(
            new AdminSectionResponse(
                100L,
                1L,
                "2026-1",
                10L,
                "CSE401",
                "운영체제",
                "01",
                "김교수",
                "공학관 101",
                "MON",
                1,
                3,
                40,
                0));

    mockMvc
        .perform(
            post("/api/admin/sections")
                .contentType("application/json")
                .content(
                    """
                    {
                      "semesterId": 1,
                      "courseId": 10,
                      "sectionNo": "01",
                      "professorName": "김교수",
                      "classroom": "공학관 101",
                      "dayOfWeek": "MON",
                      "startPeriod": 1,
                      "endPeriod": 3,
                      "capacity": 40
                    }
                    """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.sectionId").value(100))
        .andExpect(jsonPath("$.courseCode").value("CSE401"));
  }

  @Test
  void getSectionEnrollmentStatusReturnsOk() throws Exception {
    when(adminService.getSectionEnrollmentStatus(100L))
        .thenReturn(
            new AdminSectionEnrollmentStatusResponse(
                100L,
                1L,
                "2026-1",
                10L,
                "CSE401",
                "운영체제",
                "01",
                "김교수",
                "MON",
                1,
                3,
                40,
                2,
                38,
                List.of(
                    new AdminSectionEnrollmentItemResponse(
                        101L, 1L, "20230001", "홍길동", LocalDateTime.of(2026, 3, 10, 10, 0)))));

    mockMvc
        .perform(get("/api/admin/sections/100/enrollments"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.sectionId").value(100))
        .andExpect(jsonPath("$.currentCount").value(2))
        .andExpect(jsonPath("$.enrollments[0].studentNumber").value("20230001"));
  }
}
