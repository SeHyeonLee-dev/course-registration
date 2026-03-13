import { ApiError } from "../api/client";
import { Notice } from "./Notice";

export function ErrorAlert({ error }: { error: unknown }) {
  if (error instanceof ApiError) {
    const fieldErrors = Object.entries(error.fieldErrors ?? {});

    return (
      <Notice title="처리 중 문제가 발생했습니다." tone="danger">
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
    <Notice title="예상하지 못한 오류가 발생했습니다." tone="danger">
      {error instanceof Error ? error.message : "알 수 없는 오류"}
    </Notice>
  );
}
