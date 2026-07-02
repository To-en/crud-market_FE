// Bulma variant map — variant prop → Bulma modifier class
// Bulma buttons work as: <button className="button is-primary">
// The "is-*" suffix is how Bulma applies color/style variants
const BULMA_VARIANT = {
  primary:   "is-primary",    // Typical emerald green 
  secondary: "is-link",       // 
  success:   "is-success",    // Clicked 
  danger:    "is-danger",     //
  outline:   "is-outlined",   //
  ghost:     "is-ghost",      //
  // Color green

  // Color blue
};

// Props:
//   variant  — which color/style (see BULMA_VARIANT above), default "primary"
//   onClick  — function to call when clicked
//   disabled — boolean, blocks interaction
//   loading  — boolean; Bulma handles spinner via "is-loading" class (no spinner JSX needed)
//   children — label text or any JSX inside the button

export function Button({ variant = "primary", onClick, disabled, loading, children }) {

  //   "is-loading"        → Bulma shows spinner and hides children automatically
  const cls = `button ${BULMA_VARIANT[variant] ?? ""} ${loading ? "is-loading" : ""}`;

  // disabled || loading — block clicks while spinner is showing
  return (
    <button className={cls} onClick={onClick} disabled={disabled || loading}>{children}</button>
  );
}
