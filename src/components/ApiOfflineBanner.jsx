import React from "react";
import { AlertTriangle } from "lucide-react";
import { usePacks } from "../context/PacksContext";

export default function ApiOfflineBanner() {
  const { apiOnline, loading } = usePacks();

  if (loading || apiOnline) {
    return null;
  }

  return (
    <div className="api-offline-banner" role="status">
      <AlertTriangle size={16} aria-hidden="true" />
      <p>
        Catalog sync is offline — showing cached packs. New edits may not appear until the API is back.
      </p>
    </div>
  );
}
