export function Box({ children, className = "" }) {
  return <div className={`box ${className}`}>{children}</div>;
}
// Pass class name to apply any css framework