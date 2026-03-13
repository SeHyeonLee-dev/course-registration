INSERT INTO student (student_number, name, password_hash, max_credit, role)
SELECT 'admin01', '시스템 관리자', 'admin1234', 18, 'ADMIN'
WHERE NOT EXISTS (
    SELECT 1
    FROM student
    WHERE student_number = 'admin01'
);
