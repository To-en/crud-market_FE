// This table as a template will be used across the entire app

// Table for ingredient
// Table for History 



export function CategoryBar({ categories, selected, onSelect }) {
  return (
    <div className="tags">
      <span
        className={`tag is-medium is-clickable ${!selected ? "is-link" : ""}`}
        onClick={() => onSelect(null)}
      >
        All
      </span>
      {categories.map((c) => (
        <span
          key={c}
          className={`tag is-medium is-clickable ${selected === c ? "is-link" : ""}`}
          onClick={() => onSelect(c)}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

export function tableHeader({}){


}
