import type { PropsWithChildren } from "react";

type BadgeProps = PropsWithChildren<{
  tone?: "default" | "primary" | "success";
}>;

export function Badge({ children, tone = "default" }: BadgeProps) {
  return <span className={`ui-badge ui-badge--${tone}`}>{children}</span>;
}
