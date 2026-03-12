package com.university.registration.domain.section;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.university.registration.domain.section.dto.SectionDetailResponse;
import com.university.registration.domain.section.dto.SectionListItemResponse;
import com.university.registration.domain.section.dto.SectionListResponse;
import com.university.registration.domain.student.repository.StudentRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SectionController.class)
@AutoConfigureMockMvc(addFilters = false)
class SectionControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private SectionQueryService sectionQueryService;
  @MockitoBean private StudentRepository studentRepository;

  @Test
  void getSectionsReturnsPagedResult() throws Exception {
    SectionListResponse response =
        new SectionListResponse(
            List.of(
                new SectionListItemResponse(
                    1L,
                    1L,
                    "2026-1",
                    10L,
                    "CSE201",
                    "자료구조",
                    3,
                    "컴퓨터공학과",
                    "01",
                    "김교수",
                    "공학관 101",
                    "MON",
                    3,
                    4,
                    40,
                    10,
                    30)),
            0,
            20,
            1L,
            1);

    when(sectionQueryService.getSections(eq(1L), eq("자료"), eq(DayOfWeek.MON), eq(0), eq(20)))
        .thenReturn(response);

    mockMvc
        .perform(
            get("/api/sections")
                .param("semesterId", "1")
                .param("keyword", "자료")
                .param("dayOfWeek", "MON"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].sectionId").value(1))
        .andExpect(jsonPath("$.content[0].courseCode").value("CSE201"))
        .andExpect(jsonPath("$.content[0].remainingCount").value(30))
        .andExpect(jsonPath("$.page").value(0))
        .andExpect(jsonPath("$.size").value(20))
        .andExpect(jsonPath("$.totalElements").value(1))
        .andExpect(jsonPath("$.totalPages").value(1));
  }

  @Test
  void getSectionsFailsWhenSizeExceedsLimit() throws Exception {
    mockMvc
        .perform(get("/api/sections").param("semesterId", "1").param("size", "101"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("COMMON-400"));
  }

  @Test
  void getSectionDetailReturnsSection() throws Exception {
    SectionDetailResponse response =
        new SectionDetailResponse(
            1L,
            1L,
            "2026-1",
            new SectionDetailResponse.CourseInfo(10L, "CSE201", "자료구조", 3, "컴퓨터공학과"),
            "01",
            "김교수",
            "공학관 101",
            "MON",
            3,
            4,
            40,
            10,
            30);

    when(sectionQueryService.getSectionDetail(1L)).thenReturn(response);

    mockMvc
        .perform(get("/api/sections/1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.sectionId").value(1))
        .andExpect(jsonPath("$.course.courseId").value(10))
        .andExpect(jsonPath("$.course.code").value("CSE201"))
        .andExpect(jsonPath("$.course.name").value("자료구조"))
        .andExpect(jsonPath("$.remainingCount").value(30));
  }
}
