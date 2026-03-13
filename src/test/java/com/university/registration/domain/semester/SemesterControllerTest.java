package com.university.registration.domain.semester;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.university.registration.domain.semester.dto.SemesterItemResponse;
import com.university.registration.domain.semester.dto.SemesterListResponse;
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

@WebMvcTest(SemesterController.class)
@AutoConfigureMockMvc(addFilters = false)
class SemesterControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private SemesterQueryService semesterQueryService;
  @MockitoBean private StudentRepository studentRepository;

  @Test
  void getSemestersReturnsItems() throws Exception {
    when(semesterQueryService.getSemesters(false))
        .thenReturn(
            new SemesterListResponse(
                List.of(
                    new SemesterItemResponse(
                        1L,
                        "2026-1",
                        LocalDate.of(2026, 3, 2),
                        LocalDate.of(2026, 6, 20),
                        LocalDateTime.of(2026, 2, 20, 10, 0),
                        LocalDateTime.of(2026, 3, 8, 23, 59, 59)))));

    mockMvc
        .perform(get("/api/semesters"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items[0].semesterId").value(1))
        .andExpect(jsonPath("$.items[0].name").value("2026-1"));
  }

  @Test
  void getSemestersPassesActiveOnly() throws Exception {
    when(semesterQueryService.getSemesters(true)).thenReturn(new SemesterListResponse(List.of()));

    mockMvc.perform(get("/api/semesters").param("activeOnly", "true")).andExpect(status().isOk());
  }
}
