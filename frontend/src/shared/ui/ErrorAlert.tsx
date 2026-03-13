import { ApiError } from "../api/client";
import { Notice } from "./Notice";

export function ErrorAlert({ error }: { error: unknown }) {
  if (error instanceof ApiError) {
    const fieldErrors = Object.entries(error.fieldErrors ?? {});

    return (
      <Notice title={error.code ?? "API error"} tone="danger">
        <div className="stack stack--compact">
          <span>{error.message}</span>
          {fieldErrors.length > 0 && (
            <ul className="ui-notice__list">
              {fieldErrors.map(([field, message]) => (
                <li key={field}>
                  <strong>{field}</strong>: {message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Notice>
    );
  }

  return (
    <Notice title="Unexpected error" tone="danger">
      {error instanceof Error ? error.message : "Unknown error"}
    </Notice>
  );
}
