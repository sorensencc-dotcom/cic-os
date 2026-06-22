import "./table.css";

export function Table(props) {
  const { className = "", children, ...rest } = props;

  return (
    <div
      data-cic-component="table"
      className={`cic-table ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
