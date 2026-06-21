import { useCallback, useEffect, useState } from "react";
import { fetchDownloadStats } from "../utils/downloadStats";

export function useDownloadStats() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const data = await fetchDownloadStats();
    setStats(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { stats, loading, refetch };
}
