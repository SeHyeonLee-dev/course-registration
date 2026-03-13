import { ApiError } from "../api/client";
import { Notice } from "./Notice";

export function ErrorAlert({ error }: { error: unknown }) {
  if (error instanceof ApiError) {
    return (
      <Notice title={error.code ?? "API error"} tone="danger">
        {error.message}
      </Notice>
    );
  }

  return (
    <Notice title="Unexpected error" tone="danger">
      {error instanceof Error ? error.message : "Unknown error"}
    </Notice>
  );
}
