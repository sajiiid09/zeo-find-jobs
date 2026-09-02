"use client";

import { useCallback, useEffect, useState } from "react";

/** Runs an async loader, re-running whenever `deps` change. Returns { data, error, loading, reload }. */
export function useAsync(loader, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    // Synchronising with an external system (the API); the loading flag has to flip here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    loader()
      .then((result) => {
        if (active) {
          setData(result);
          setError("");
        }
      })
      .catch((err) => {
        if (active) setError(err.message || "Something went wrong.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { data, error, loading, reload, setData };
}
