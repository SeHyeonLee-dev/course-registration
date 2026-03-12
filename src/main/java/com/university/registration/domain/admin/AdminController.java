package com.university.registration.domain.admin;

import com.university.registration.domain.admin.dto.AdminCourseCreateRequest;
import com.university.registration.domain.admin.dto.AdminCourseResponse;
import com.university.registration.domain.admin.dto.AdminSectionCreateRequest;
import com.university.registration.domain.admin.dto.AdminSectionEnrollmentStatusResponse;
import com.university.registration.domain.admin.dto.AdminSectionResponse;
import com.university.registration.domain.admin.dto.AdminSemesterCreateRequest;
import com.university.registration.domain.admin.dto.AdminSemesterResponse;
import com.university.registration.domain.admin.dto.AdminSemesterUpdatePeriodRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "관리자 전용 학기/강의/분반 관리 API")
@SecurityRequirement(name = "sessionAuth")
public class AdminController {
  private final AdminService adminService;

  @PostMapping("/semesters")
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(
      summary = "학기 생성",
      description = "학기명, 학사 일정, 수강신청 기간을 등록합니다.",
      responses = {
        @ApiResponse(responseCode = "201", description = "학기 생성 성공"),
        @ApiResponse(responseCode = "400", description = "입력값 오류"),
        @ApiResponse(responseCode = "409", description = "학기명 중복")
      })
  public AdminSemesterResponse createSemester(@Valid @RequestBody AdminSemesterCreateRequest request) {
    return adminService.createSemester(request);
  }

  @PutMapping("/semesters/{semesterId}/enrollment-period")
  @Operation(
      summary = "수강신청 기간 수정",
      description = "기존 학기의 수강신청 시작/종료 일시를 수정합니다.",
      responses = {
        @ApiResponse(responseCode = "200", description = "수강신청 기간 수정 성공"),
        @ApiResponse(responseCode = "400", description = "입력값 오류"),
        @ApiResponse(responseCode = "404", description = "학기 없음")
      })
  public AdminSemesterResponse updateEnrollmentPeriod(
      @PathVariable Long semesterId, @Valid @RequestBody AdminSemesterUpdatePeriodRequest request) {
    return adminService.updateEnrollmentPeriod(semesterId, request);
  }

  @PostMapping("/courses")
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(
      summary = "강의 등록",
      description = "강의 코드, 강의명, 학점, 학과 정보를 등록합니다.",
      responses = {
        @ApiResponse(responseCode = "201", description = "강의 등록 성공"),
        @ApiResponse(responseCode = "400", description = "입력값 오류"),
        @ApiResponse(responseCode = "409", description = "강의 코드 중복")
      })
  public AdminCourseResponse createCourse(@Valid @RequestBody AdminCourseCreateRequest request) {
    return adminService.createCourse(request);
  }

  @PostMapping("/sections")
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(
      summary = "분반 등록",
      description = "학기, 강의, 정원, 시간표, 교수, 강의실 정보를 포함한 분반을 등록합니다.",
      responses = {
        @ApiResponse(responseCode = "201", description = "분반 등록 성공"),
        @ApiResponse(responseCode = "400", description = "입력값 오류"),
        @ApiResponse(responseCode = "404", description = "학기 또는 강의 없음"),
        @ApiResponse(responseCode = "409", description = "분반 번호 중복")
      })
  public AdminSectionResponse createSection(@Valid @RequestBody AdminSectionCreateRequest request) {
    return adminService.createSection(request);
  }

  @GetMapping("/sections/{sectionId}/enrollments")
  @Operation(
      summary = "분반별 신청 현황 조회",
      description = "특정 분반의 정원, 현재 신청 인원, 신청 학생 목록을 조회합니다.",
      responses = {
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "분반 없음")
      })
  public AdminSectionEnrollmentStatusResponse getSectionEnrollmentStatus(@PathVariable Long sectionId) {
    return adminService.getSectionEnrollmentStatus(sectionId);
  }
}
