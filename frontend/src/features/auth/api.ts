import { ApiError, apiFetch } from "../../shared/api/client";
import type { LoginRequest, LoginResponse, MeResponse } from "./types";

export function login(body: LoginRequest) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function logout() {
  return apiFetch<void>("/auth/logout", {
    method: "POST",
  });
}

export function getMe() {
  return apiFetch<MeResponse>("/auth/me");
}

export async function getMeOrNull() {
  try {
    return await getMe();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}
