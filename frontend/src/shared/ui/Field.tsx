import type { PropsWithChildren } from "react";

type FieldProps = PropsWithChildren<{
  hint?: string;
  htmlFor?: string;
  label: string;
}>;

export function Field({ children, hint, htmlFor, label }: FieldProps) {
  return (
    <label className="ui-field" htmlFor={htmlFor}>
      <span className="ui-field__label">{label}</span>
      {children}
      {hint && <span className="ui-field__hint">{hint}</span>}
    </label>
  );
}
