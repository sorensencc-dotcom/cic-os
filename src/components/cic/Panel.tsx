import React from "react";
import "./panel.css";

export interface PanelProps extends React.HTMLAttributes<HTMLElement> {
  padding?: "default" | "none";
  elevation?: "default" | "none";
  children: React.ReactNode;
}

export const Panel = React.forwardRef<HTMLElement, PanelProps>(
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
        className={className ? `cic-panel ${className}` : "cic-panel"}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Panel.displayName = "Panel";
