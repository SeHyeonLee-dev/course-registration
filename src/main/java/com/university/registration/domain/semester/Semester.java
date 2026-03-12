package com.university.registration.domain.semester;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "semester")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Semester {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "name", nullable = false, unique = true, length = 20)
  private String name;

  @Column(name = "start_date", nullable = false)
  private LocalDate startDate;

  @Column(name = "end_date", nullable = false)
  private LocalDate endDate;

  @Column(name = "enroll_start_at", nullable = false)
  private LocalDateTime enrollStartAt;

  @Column(name = "enroll_end_at", nullable = false)
  private LocalDateTime enrollEndAt;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  public Semester(
      String name,
      LocalDate startDate,
      LocalDate endDate,
      LocalDateTime enrollStartAt,
      LocalDateTime enrollEndAt) {
    this.name = name;
    this.startDate = startDate;
    this.endDate = endDate;
    this.enrollStartAt = enrollStartAt;
    this.enrollEndAt = enrollEndAt;
  }

  public void updateEnrollmentPeriod(LocalDateTime enrollStartAt, LocalDateTime enrollEndAt) {
    this.enrollStartAt = enrollStartAt;
    this.enrollEndAt = enrollEndAt;
  }

  @PrePersist
  void onCreate() {
    LocalDateTime now = LocalDateTime.now();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @PreUpdate
  void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof Semester other)) {
      return false;
    }
    return id != null && id.equals(other.id);
  }

  @Override
  public int hashCode() {
    return getClass().hashCode();
  }
}
