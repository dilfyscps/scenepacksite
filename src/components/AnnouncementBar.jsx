import React from "react";
import { Link } from "react-router-dom";
import { Megaphone, X } from "lucide-react";
import { useAnnouncement } from "../hooks/useAnnouncement";

export default function AnnouncementBar() {
  const announcement = useAnnouncement();
  const [dismissed, setDismissed] = React.useState(false);

  if (!announcement?.enabled || !announcement.message || dismissed) {
    return null;
  }

  return (
    <div className="announcement-bar">
      <div className="announcement-bar-inner">
        <Megaphone size={16} aria-hidden="true" />
        <p>{announcement.message}</p>
        {announcement.link ? (
          announcement.link.startsWith("/") ? (
            <Link to={announcement.link} className="announcement-bar-link">
              {announcement.linkLabel || "Learn more"}
            </Link>
          ) : (
            <a href={announcement.link} className="announcement-bar-link" target="_blank" rel="noopener noreferrer">
              {announcement.linkLabel || "Learn more"}
            </a>
          )
        ) : null}
        <button
          type="button"
          className="announcement-bar-close"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss announcement"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
