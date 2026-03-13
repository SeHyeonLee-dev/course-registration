import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { ErrorAlert } from "../../shared/ui/ErrorAlert";
import { Field } from "../../shared/ui/Field";
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
    return <Navigate replace to={meQuery.data.role === "ROLE_ADMIN" ? "/admin" : "/sections"} />;
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

    navigate(me?.role === "ROLE_ADMIN" ? "/admin" : "/sections", { replace: true });
  }

  return (
    <Page description="학번과 비밀번호를 입력해 로그인하세요." title="로그인">
      <Card className="auth-panel" subtitle="학생 또는 관리자 계정으로 접속할 수 있습니다." title="접속하기">
        <form className="auth-form" onSubmit={handleSubmit}>
          <Field htmlFor="studentNumber" label="학번">
            <input id="studentNumber" name="studentNumber" placeholder="학번을 입력하세요" required />
          </Field>

          <Field htmlFor="password" label="비밀번호">
            <input id="password" name="password" placeholder="비밀번호를 입력하세요" required type="password" />
          </Field>

          {loginMutation.error && <ErrorAlert error={loginMutation.error} />}

          <Button isLoading={loginMutation.isPending} type="submit">
            로그인
          </Button>
        </form>
      </Card>
    </Page>
  );
}
