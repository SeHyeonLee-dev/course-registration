package com.university.registration.domain.student;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "student")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Student {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "student_number", nullable = false, unique = true, length = 30)
  private String studentNumber;

  @Column(name = "name", nullable = false, length = 100)
  private String name;

  @Column(name = "password_hash", nullable = false, length = 255)
  private String passwordHash;

  @Column(name = "max_credit", nullable = false)
  private Integer maxCredit = 18;

  @Enumerated(EnumType.STRING)
  @Column(name = "role", nullable = false, length = 20)
  private StudentRole role = StudentRole.STUDENT;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  // Extension point: admin can be split into a dedicated aggregate later.
  public Student(String studentNumber, String name, String passwordHash, Integer maxCredit) {
    this(studentNumber, name, passwordHash, maxCredit, StudentRole.STUDENT);
  }

  public Student(
      String studentNumber, String name, String passwordHash, Integer maxCredit, StudentRole role) {
    this.studentNumber = studentNumber;
    this.name = name;
    this.passwordHash = passwordHash;
    if (maxCredit != null) {
      this.maxCredit = maxCredit;
    }
    if (role != null) {
      this.role = role;
    }
  }

  @PrePersist
  void onCreate() {
    LocalDateTime now = LocalDateTime.now();
    this.createdAt = now;
    this.updatedAt = now;
    if (this.maxCredit == null) {
      this.maxCredit = 18;
    }
    if (this.role == null) {
      this.role = StudentRole.STUDENT;
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
    if (!(o instanceof Student other)) {
      return false;
    }
    return id != null && id.equals(other.id);
  }

  @Override
  public int hashCode() {
    return getClass().hashCode();
  }
}
