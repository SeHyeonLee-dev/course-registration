import type { HTMLAttributes, PropsWithChildren } from "react";

type CardProps = PropsWithChildren<
  HTMLAttributes<HTMLElement> & {
    title?: string;
    subtitle?: string;
  }
>;

export function Card({ children, className, subtitle, title, ...props }: CardProps) {
  return (
    <section className={["ui-card", className].filter(Boolean).join(" ")} {...props}>
      {(title || subtitle) && (
        <header className="ui-card__header">
          {title && <h3 className="ui-card__title">{title}</h3>}
          {subtitle && <p className="ui-card__subtitle">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
