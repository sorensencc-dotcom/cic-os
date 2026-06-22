import React from "react";
import "./row.css";

export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  children: React.ReactNode;
}

export const Row = React.forwardRef<HTMLDivElement, RowProps>(
  (
    {
      selected = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-cic-component="row"
        data-selected={selected}
        className={["cic-row", className].filter(Boolean).join(" ")}
        tabIndex={0}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Row.displayName = "Row";
