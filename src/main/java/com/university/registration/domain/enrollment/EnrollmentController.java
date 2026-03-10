package com.university.registration.domain.enrollment;

import com.university.registration.domain.enrollment.dto.EnrollmentApplyRequest;
import com.university.registration.domain.enrollment.dto.EnrollmentApplyResponse;
import com.university.registration.domain.enrollment.dto.MyEnrollmentResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/api/enrollments")
public class EnrollmentController {
  private final EnrollmentService enrollmentService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public EnrollmentApplyResponse apply(
      @Valid @RequestBody EnrollmentApplyRequest request, HttpServletRequest httpServletRequest) {
    return enrollmentService.apply(request, httpServletRequest.getSession(false));
  }

  @DeleteMapping("/{enrollmentId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void cancel(@PathVariable Long enrollmentId, HttpServletRequest httpServletRequest) {
    enrollmentService.cancel(enrollmentId, httpServletRequest.getSession(false));
  }

  @GetMapping("/my")
  public MyEnrollmentResponse getMyEnrollments(
      @RequestParam(required = false) Long semesterId, HttpServletRequest httpServletRequest) {
    return enrollmentService.getMyEnrollments(semesterId, httpServletRequest.getSession(false));
  }
}
