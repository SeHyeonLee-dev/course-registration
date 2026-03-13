import type { ButtonHTMLAttributes, PropsWithChildren, ReactElement } from "react";
import { cloneElement, isValidElement } from "react";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    isLoading?: boolean;
    size?: "sm" | "md";
    variant?: "primary" | "secondary" | "ghost";
  }
>;

export function Button({
  asChild = false,
  children,
  className,
  isLoading = false,
  size = "md",
  variant = "primary",
  ...props
}: ButtonProps) {
  const classes = [
    "ui-button",
    `ui-button--${variant}`,
    `ui-button--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>;

    return cloneElement(child, {
      className: [classes, child.props.className].filter(Boolean).join(" "),
    });
  }

  return (
    <button className={classes} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? "처리 중..." : children}
    </button>
  );
}
