import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useMeQuery } from "../../features/auth/hooks";
import { Page } from "../../shared/ui/Page";

export function HomeRedirect() {
  const meQuery = useMeQuery();

  if (meQuery.isLoading) {
    return <Page title="불러오는 중">사용자 정보를 확인하고 있습니다.</Page>;
  }

  return <Navigate replace to={meQuery.data ? "/sections" : "/login"} />;
}

export function AuthGuard({ children }: { children: ReactElement }) {
  const meQuery = useMeQuery();

  if (meQuery.isLoading) {
    return <Page title="불러오는 중">사용자 정보를 확인하고 있습니다.</Page>;
  }

  if (!meQuery.data) {
    return <Navigate replace to="/login" />;
  }

  return children;
}

export function AdminGuard({ children }: { children: ReactElement }) {
  const meQuery = useMeQuery();

  if (meQuery.isLoading) {
    return <Page title="불러오는 중">접근 권한을 확인하고 있습니다.</Page>;
  }

  if (!meQuery.data) {
    return <Navigate replace to="/login" />;
  }

  if (meQuery.data.role !== "ROLE_ADMIN") {
    return <Navigate replace to="/403" />;
  }

  return children;
}
