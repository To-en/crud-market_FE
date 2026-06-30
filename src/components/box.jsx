// Thin Bulma .box wrapper — padded, rounded surface for grouping content
export function Box({ children, className = "" }) {
  return <div className={`box ${className}`}>{children}</div>;
}
