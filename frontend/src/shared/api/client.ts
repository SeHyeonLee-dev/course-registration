export class ApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string>;

  constructor(
    status: number,
    message: string,
    options?: {
      code?: string;
      fieldErrors?: Record<string, string>;
    },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = options?.code;
    this.fieldErrors = options?.fieldErrors;
  }
}

type ApiErrorResponse = {
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`/api${path}`, {
    credentials: "include",
    ...init,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const errorBody = (data ?? {}) as ApiErrorResponse;
    throw new ApiError(response.status, errorBody.message ?? "Request failed.", {
      code: errorBody.code,
      fieldErrors: errorBody.fieldErrors,
    });
  }

  return data as T;
}
