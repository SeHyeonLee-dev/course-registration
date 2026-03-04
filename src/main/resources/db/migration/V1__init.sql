CREATE TABLE student (
    id BIGINT NOT NULL AUTO_INCREMENT,
    student_number VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    max_credit INT NOT NULL DEFAULT 18,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_student_student_number UNIQUE (student_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE semester (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    enroll_start_at DATETIME NOT NULL,
    enroll_end_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_semester_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE course (
    id BIGINT NOT NULL AUTO_INCREMENT,
    code VARCHAR(30) NOT NULL,
    name VARCHAR(200) NOT NULL,
    credit INT NOT NULL,
    department VARCHAR(100) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_course_code UNIQUE (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE section (
    id BIGINT NOT NULL AUTO_INCREMENT,
    semester_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    section_no VARCHAR(20) NOT NULL,
    professor_name VARCHAR(100) NOT NULL,
    classroom VARCHAR(100) NULL,
    day_of_week VARCHAR(10) NOT NULL,
    start_period INT NOT NULL,
    end_period INT NOT NULL,
    capacity INT NOT NULL,
    current_count INT NOT NULL DEFAULT 0,
    version BIGINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_section_semester_course_no UNIQUE (semester_id, course_id, section_no),
    CONSTRAINT fk_section_semester FOREIGN KEY (semester_id) REFERENCES semester (id),
    CONSTRAINT fk_section_course FOREIGN KEY (course_id) REFERENCES course (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE enrollment (
    id BIGINT NOT NULL AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    section_id BIGINT NOT NULL,
    enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_enrollment_student_section UNIQUE (student_id, section_id),
    CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) REFERENCES student (id),
    CONSTRAINT fk_enrollment_section FOREIGN KEY (section_id) REFERENCES section (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_section_semester_id ON section (semester_id);
CREATE INDEX idx_section_course_id ON section (course_id);
CREATE INDEX idx_section_semester_day_period ON section (semester_id, day_of_week, start_period, end_period);

CREATE INDEX idx_enrollment_student_id ON enrollment (student_id);
CREATE INDEX idx_enrollment_section_id ON enrollment (section_id);
