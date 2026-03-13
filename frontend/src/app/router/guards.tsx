import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useMeQuery } from "../../features/auth/hooks";
import { Page } from "../../shared/ui/Page";

export function HomeRedirect() {
  const meQuery = useMeQuery();

  if (meQuery.isLoading) {
    return <Page title="Loading">Checking session...</Page>;
  }

  return <Navigate replace to={meQuery.data ? "/semesters" : "/login"} />;
}

export function AuthGuard({ children }: { children: ReactElement }) {
  const meQuery = useMeQuery();

  if (meQuery.isLoading) {
    return <Page title="Loading">Checking session...</Page>;
  }

  if (!meQuery.data) {
    return <Navigate replace to="/login" />;
  }

  return children;
}

export function AdminGuard({ children }: { children: ReactElement }) {
  const meQuery = useMeQuery();

  if (meQuery.isLoading) {
    return <Page title="Loading">Checking permissions...</Page>;
  }

  if (!meQuery.data) {
    return <Navigate replace to="/login" />;
  }

  if (meQuery.data.role !== "ROLE_ADMIN") {
    return <Navigate replace to="/403" />;
  }

  return children;
}
