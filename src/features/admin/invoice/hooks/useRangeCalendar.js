import { useState } from "react";

export default function useRangeCalendar({ from, to, onChange }) {
  const [view, setView] = useState(() => {
    const date = from ? new Date(`${from}T00:00:00`) : new Date();
    return { year: date.getFullYear(), month: date.getMonth() };
  });
  const [hover, setHover] = useState("");

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const changeMonth = (step) =>
    setView((prev) => {
      const date = new Date(prev.year, prev.month + step, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });

  const pickDay = (value) => {
    if (!from || to) onChange(value, "");
    else if (value < from) onChange(value, from);
    else onChange(from, value);
  };

  const previewEnd = to || (from && hover > from ? hover : from);

  return { view, cells, changeMonth, pickDay, setHover, previewEnd };
}
