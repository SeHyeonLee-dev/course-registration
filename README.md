# Registration Project

## Flyway Migration

- Migration location: `src/main/resources/db/migration`
- Initial schema script: `V1__init.sql`
- Flyway config:
  - `spring.flyway.enabled=true`
  - `spring.flyway.locations=classpath:db/migration`
  - `spring.flyway.baseline-on-migrate=true`
- JPA schema mode: `spring.jpa.hibernate.ddl-auto=validate`

## Local Verification

1. Run one of:
   - `./gradlew test`
   - `./gradlew bootRun`
2. Connect to MySQL and verify Flyway history table:
   - `SHOW TABLES LIKE 'flyway_schema_history';`
   - `SELECT installed_rank, version, description, success FROM flyway_schema_history ORDER BY installed_rank;`

If `flyway_schema_history` exists and `V1__init` is recorded with `success=1`, Flyway is applied.

## Code Formatting (Spotless)

- Auto-format Java sources:
  - `./gradlew spotlessApply`
- Verify formatting (fails on violations):
  - `./gradlew spotlessCheck`

When CI runs `./gradlew check`, formatting is also validated because `check` depends on `spotlessCheck`.

## Concurrency Test

- Test file: `src/test/java/com/university/registration/domain/enrollment/EnrollmentConcurrencyTest.java`
- Command:
  - `GRADLE_USER_HOME=/tmp/gradle-home ./gradlew test --tests com.university.registration.domain.enrollment.EnrollmentConcurrencyTest`
- Scenario:
  - capacity `5`
  - concurrent requests `20`
  - all threads call `EnrollmentService.apply()` at the same time

### Expected Assertions

- `Enrollment` row count equals `capacity`
- `Section.currentCount` does not exceed `capacity`
- all failed requests are handled with `COURSE_CAPACITY_EXCEEDED`
- all failure messages equal `정원 마감`

### Latest Run Result

- Code for the concurrency test was added.
- Local execution is currently blocked by a Gradle startup error:
  - `java.io.IOException: Input/output error`
- Because of that environment issue, the test result could not be captured in this workspace run.
