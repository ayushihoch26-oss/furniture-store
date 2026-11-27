import { useState } from "react";

/** State for the filter popover (anchor + min/max inputs). */
export default function useFilterPopover({ minTotal, maxTotal, onFiltersChange }) {
  const [anchor, setAnchor] = useState(null);
  const [minText, setMinText] = useState(minTotal);
  const [maxText, setMaxText] = useState(maxTotal);

  const open = (event) => {
    setMinText(minTotal);
    setMaxText(maxTotal);
    setAnchor(event.currentTarget);
  };
  const close = () => setAnchor(null);

  const apply = () => {
    onFiltersChange({ minTotal: minText, maxTotal: maxText });
    close();
  };

  const clear = () => {
    setMinText("");
    setMaxText("");
    onFiltersChange({ fromDate: "", toDate: "", minTotal: "", maxTotal: "" });
  };

  return { anchor, open, close, apply, clear, minText, setMinText, maxText, setMaxText };
}
