// useFetch.js
// My tiny data-fetching hook for this lab. Opinionated on purpose:
// - Fetches immediately on mount
// - Gives me { data, setData, loading, error, refetch }
// - Keeps the API dead simple for tests + demo UIs

import { useCallback, useEffect, useState } from "react";

/**
 * useFetch(url)
 * - GETs JSON from `url`
 * - returns { data, setData, loading, error, refetch }
 * - safe for immediate use on mount; call `refetch()` to refresh
 */
export default function useFetch(url) {
  const [data, setData] = useState(null);      // whatever the endpoint returns
  const [loading, setLoading] = useState(true); // true until first response
  const [error, setError] = useState(null);     // stringified error

  // memoized fetcher so the effect below doesn't loop forever
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`); // make non-2xx fail fast
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  // kick off the initial GET once the hook mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, setData, loading, error, refetch };
}
