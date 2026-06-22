import "./alert.css";

export function Alert(props) {
  const { className = "", children, ...rest } = props;

  return (
    <div
      data-cic-component="alert"
      className={`cic-alert ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
