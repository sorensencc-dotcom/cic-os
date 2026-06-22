import React from "react";
import "./panel.css";

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "default" | "none";
  elevation?: "default" | "none";
  children: React.ReactNode;
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      padding = "default",
      elevation = "default",
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        data-cic-component="panel"
        data-padding={padding}
        data-elevation={elevation}
        className={["cic-panel", className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Panel.displayName = "Panel";
