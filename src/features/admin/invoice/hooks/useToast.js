import { useCallback, useState } from "react";

export default function useToast() {
  const [toast, setToast] = useState("");

  const showToast = useCallback((message) => setToast(message), []);
  const clearToast = useCallback(() => setToast(""), []);

  return { toast, showToast, clearToast };
}
