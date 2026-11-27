import { useEffect, useState } from "react";
import { SEARCH_DEBOUNCE_MS } from "../constants/invoice.constants";

/** Calls onSearch a short time after the user stops typing. */
export default function useDebouncedSearch(currentSearch, onSearch) {
  const [searchText, setSearchText] = useState(currentSearch);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const search = searchText.trim();
      if (search !== currentSearch) onSearch({ search });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [searchText, currentSearch, onSearch]);

  return { searchText, setSearchText };
}
