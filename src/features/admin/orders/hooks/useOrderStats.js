// hooks/useOrderStats.js
// Loads the numbers for the 4 stat cards.
import { useCallback, useEffect, useState } from "react";
import { fetchOrderStats } from "../services/orderService";

export default function useOrderStats() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    newOrders: 0,
    completedOrders: 0,
    canceledOrders: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setStats(await fetchOrderStats());
    } catch (err) {
      setError(err.message || "Unable to load order statistics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, error, reloadStats: loadStats };
}
