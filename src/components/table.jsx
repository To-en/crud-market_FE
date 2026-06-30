// Ingredient category filter bar — flat list of pills, single select
import { CATEGORY_EMOJI } from "../utils/constants";

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
          {CATEGORY_EMOJI[c] ?? ""} {c}
        </span>
      ))}
    </div>
  );
}
