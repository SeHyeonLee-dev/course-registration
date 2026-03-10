package com.university.registration.domain.section;

import com.university.registration.domain.course.Course;
import com.university.registration.domain.semester.Semester;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "section",
    uniqueConstraints = {
      @UniqueConstraint(
          name = "uk_section_semester_course_no",
          columnNames = {"semester_id", "course_id", "section_no"})
    })
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Section {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "semester_id", nullable = false)
  private Semester semester;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "course_id", nullable = false)
  private Course course;

  @Column(name = "section_no", nullable = false, length = 20)
  private String sectionNo;

  @Column(name = "professor_name", nullable = false, length = 100)
  private String professorName;

  @Column(name = "classroom", length = 100)
  private String classroom;

  @Enumerated(EnumType.STRING)
  @Column(name = "day_of_week", nullable = false, length = 10)
  private DayOfWeek dayOfWeek;

  @Column(name = "start_period", nullable = false)
  private Integer startPeriod;

  @Column(name = "end_period", nullable = false)
  private Integer endPeriod;

  @Column(name = "capacity", nullable = false)
  private Integer capacity;

  @Column(name = "current_count", nullable = false)
  private Integer currentCount = 0;

  @Version
  @Column(name = "version", nullable = false)
  private Long version = 0L;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  public Section(
      Semester semester,
      Course course,
      String sectionNo,
      String professorName,
      String classroom,
      DayOfWeek dayOfWeek,
      Integer startPeriod,
      Integer endPeriod,
      Integer capacity) {
    this.semester = semester;
    this.course = course;
    this.sectionNo = sectionNo;
    this.professorName = professorName;
    this.classroom = classroom;
    this.dayOfWeek = dayOfWeek;
    this.startPeriod = startPeriod;
    this.endPeriod = endPeriod;
    this.capacity = capacity;
  }

  public void increaseCurrentCount() {
    this.currentCount = this.currentCount + 1;
  }

  public void decreaseCurrentCount() {
    if (this.currentCount <= 0) {
      throw new IllegalStateException("현재 신청 인원이 0보다 작아질 수 없습니다.");
    }
    this.currentCount = this.currentCount - 1;
  }

  @PrePersist
  void onCreate() {
    LocalDateTime now = LocalDateTime.now();
    this.createdAt = now;
    this.updatedAt = now;
    if (this.currentCount == null) {
      this.currentCount = 0;
    }
    if (this.version == null) {
      this.version = 0L;
    }
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
    if (!(o instanceof Section other)) {
      return false;
    }
    return id != null && id.equals(other.id);
  }

  @Override
  public int hashCode() {
    return getClass().hashCode();
  }
}
