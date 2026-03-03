package com.university.registration.domain.enrollment;

import com.university.registration.domain.section.Section;
import com.university.registration.domain.student.Student;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "enrollment",
    uniqueConstraints = {
      @UniqueConstraint(name = "uk_enrollment_student_section", columnNames = {"student_id", "section_id"})
    })
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Enrollment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "student_id", nullable = false)
  private Student student;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "section_id", nullable = false)
  private Section section;

  @Column(name = "enrolled_at", nullable = false)
  private LocalDateTime enrolledAt;

  public Enrollment(Student student, Section section) {
    this.student = student;
    this.section = section;
  }

  @PrePersist
  void onCreate() {
    if (this.enrolledAt == null) {
      this.enrolledAt = LocalDateTime.now();
    }
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof Enrollment other)) {
      return false;
    }
    return id != null && id.equals(other.id);
  }

  @Override
  public int hashCode() {
    return getClass().hashCode();
  }
}
