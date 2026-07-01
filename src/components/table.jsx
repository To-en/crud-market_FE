import { CATEGORY_EMOJI } from "../utils/constants";
import { requestHTTP } from "../utils/api";
import { useEffect } from "react";

// This table as a template will be used across the entire app

// Table for ingredient
// Table for History 



export function CategoryBar({ categories, selected, onSelect }) {
  useEffect(()=>{
    

  },[])
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

export function tableHeader({}){


}
