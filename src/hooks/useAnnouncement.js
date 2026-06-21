import { useEffect, useState } from "react";
import { fetchAnnouncement } from "../utils/siteApi";

export function useAnnouncement() {
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    fetchAnnouncement().then(setAnnouncement);
  }, []);

  return announcement;
}
