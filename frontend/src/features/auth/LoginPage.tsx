import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { ErrorAlert } from "../../shared/ui/ErrorAlert";
import { Field } from "../../shared/ui/Field";
import { Notice } from "../../shared/ui/Notice";
import { Page } from "../../shared/ui/Page";
import { queryKeys } from "../../shared/api/queryKeys";
import { getMeOrNull } from "./api";
import { useLoginMutation, useMeQuery } from "./hooks";

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const meQuery = useMeQuery();
  const loginMutation = useLoginMutation();

  if (meQuery.data) {
    return <Navigate replace to={meQuery.data.role === "ROLE_ADMIN" ? "/admin" : "/semesters"} />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await loginMutation.mutateAsync({
      studentNumber: String(formData.get("studentNumber") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    const me = await queryClient.fetchQuery({
      queryKey: queryKeys.auth.me(),
      queryFn: getMeOrNull,
    });

    navigate(me?.role === "ROLE_ADMIN" ? "/admin" : "/semesters", { replace: true });
  }

  return (
    <Page
      description="Session-based login against POST /api/auth/login and GET /api/auth/me."
      title="Login"
    >
      <Card
        className="auth-panel"
        subtitle="Use a valid student account or the seeded admin account."
        title="Sign in"
      >
        <form className="auth-form" onSubmit={handleSubmit}>
          <Field htmlFor="studentNumber" label="Student number">
            <input defaultValue="20230001" id="studentNumber" name="studentNumber" required />
          </Field>

          <Field htmlFor="password" label="Password">
            <input defaultValue="password123" id="password" name="password" required type="password" />
          </Field>

          <Notice title="Known accounts" tone="info">
            Student example: <code>20230001 / password123</code>
            <br />
            Admin seed: <code>admin01 / admin1234</code>
          </Notice>

          {loginMutation.error && <ErrorAlert error={loginMutation.error} />}

          <Button isLoading={loginMutation.isPending} type="submit">
            Login
          </Button>
        </form>
      </Card>
    </Page>
  );
}
