import React from "react";
import "./input.css";

type InputType = "text" | "email" | "password" | "number";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: InputType;
  size?: "small" | "medium" | "large";
  error?: boolean;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ size = "medium", error, label, className, ...props }, ref) => {
    return (
      <div className="cic-input-group">
        {label && <label className="cic-input-label">{label}</label>}
        <input
          ref={ref}
          className={[
            "cic-input",
            `cic-input--${size}`,
            error && "cic-input--error",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
