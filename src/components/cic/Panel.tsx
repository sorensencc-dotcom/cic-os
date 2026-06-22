import "./panel.css";

export function Panel(props) {
  const { className = "", children, ...rest } = props;

  return (
    <div
      data-cic-component="panel"
      className={`cic-panel ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
