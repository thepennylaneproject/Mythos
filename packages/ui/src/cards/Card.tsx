import type { ReactNode } from "react";

export interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

const cx = (...classes: Array<string | undefined | false>) => classes.filter(Boolean).join(" ");

export function Card({ title, children, className }: CardProps) {
  return (
    <div className={cx("rounded-lg border bg-white shadow-sm p-4", className)}>
      {title ? <h3 className="text-sm font-semibold text-neutral-800 mb-2">{title}</h3> : null}
      <div className="text-sm text-neutral-700">{children}</div>
    </div>
  );
}
