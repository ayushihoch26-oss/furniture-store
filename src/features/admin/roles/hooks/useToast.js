import { useCallback, useState } from "react";

export default function useToast() {
  const [toast, setToast] = useState(null); // { severity, text }

  const showToast = useCallback(
    (text, severity = "success") => setToast({ severity, text }),
    [],
  );
  const clearToast = useCallback(() => setToast(null), []);

  return { toast, showToast, clearToast };
}
