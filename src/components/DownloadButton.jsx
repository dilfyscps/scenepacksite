import React from "react";
import { Download, ExternalLink } from "lucide-react";
import { trackDownload } from "../utils/downloadStats";

export default function DownloadButton({ pack, className, onTracked, children }) {
  const downloadUrl = pack.download?.trim();
  const isExternal = downloadUrl?.startsWith("http");

  if (!downloadUrl) {
    return null;
  }

  const handleClick = async (event) => {
    event.preventDefault();
    await trackDownload(pack.slug);
    onTracked?.();

    if (isExternal) {
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = downloadUrl;
    }
  };

  return (
    <a
      href={downloadUrl}
      className={className}
      onClick={handleClick}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children ?? (
        <>
          <Download size={18} aria-hidden="true" />
          Download Pack
          {isExternal && <ExternalLink size={14} aria-hidden="true" />}
        </>
      )}
    </a>
  );
}
