import type { PropsWithChildren, ReactNode } from "react";

type PageProps = PropsWithChildren<{
  actions?: ReactNode;
  description?: string;
  title: string;
}>;

export function Page({ actions, children, description, title }: PageProps) {
  return (
    <section className="page">
      <header className="page__header">
        <div className="page__copy">
          <h2 className="page__title">{title}</h2>
          {description && <p className="page__description">{description}</p>}
        </div>
        {actions && <div className="page__actions">{actions}</div>}
      </header>
      <div className="page__body">{children}</div>
    </section>
  );
}
