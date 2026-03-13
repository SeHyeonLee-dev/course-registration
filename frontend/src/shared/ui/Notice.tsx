import type { PropsWithChildren } from "react";

type NoticeProps = PropsWithChildren<{
  tone?: "info" | "danger" | "success";
  title?: string;
}>;

export function Notice({ children, title, tone = "info" }: NoticeProps) {
  return (
    <div className={`ui-notice ui-notice--${tone}`}>
      {title && <strong className="ui-notice__title">{title}</strong>}
      <div>{children}</div>
    </div>
  );
}
