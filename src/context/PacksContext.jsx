import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchPacks } from "../utils/packsApi";
import { STATIC_PACKS } from "../utils/packUtils";

const PacksContext = createContext(null);

export function PacksProvider({ children }) {
  const [packs, setPacks] = useState(STATIC_PACKS);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(true);

  const refreshPacks = useCallback(async () => {
    try {
      const data = await fetchPacks();
      if (Array.isArray(data)) {
        setPacks(data);
        setApiOnline(true);
      }
    } catch {
      setApiOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPacks();
  }, [refreshPacks]);

  return (
    <PacksContext.Provider value={{ packs, loading, apiOnline, refreshPacks }}>
      {children}
    </PacksContext.Provider>
  );
}

export function usePacks() {
  const context = useContext(PacksContext);
  if (!context) {
    throw new Error("usePacks must be used within PacksProvider");
  }
  return context;
}
