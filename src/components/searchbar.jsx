// Search input — controlled, fires onChange on every keystroke, clear (×) when filled
export function SearchBar({ value, onChange, placeholder = "Search…" }) {
  return (
    <div className="field has-addons">
      <div className="control is-expanded has-icons-right">
        <input
          className="input"
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            type="button"
            className="icon is-right is-clickable"
            aria-label="clear"
            onClick={() => onChange("")}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
