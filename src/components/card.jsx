// Bulma card structure:
//
//   <div className="card">
//     <div className="card-header">
//       <p className="card-header-title">Title</p>   ← left side
//       <div className="card-header-icon">...</div>  ← right side (optional action)
//     </div>
//     <div className="card-content">
//       {children}                                    ← your page content goes here
//     </div>
//   </div>
//
// Props:
//   title    — string shown in card header
//   children — anything inside the card body
//   action   — optional JSX (e.g. a Button) placed on the right of the header

export function Card({ title, children, action }) {
  return (
    <div className="card">
      <div className="card-header">
        {/* card-header-title: bold left-aligned text */}
        <p className="card-header-title">{title}</p>

        {/* Only render the right side if action prop is passed */}
        {action && (
          <div className="card-header-icon">{action}</div>
        )}
      </div>

      {/* card-content: adds padding around your content */}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
}
