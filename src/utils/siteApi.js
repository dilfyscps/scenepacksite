import { STATS_API_BASE } from "./downloadStats";

export async function fetchAnnouncement() {
  try {
    const res = await fetch(`${STATS_API_BASE}/api/announcement`);
    if (!res.ok) return { enabled: false, message: "", link: "", linkLabel: "Learn more" };
    return res.json();
  } catch {
    return { enabled: false, message: "", link: "", linkLabel: "Learn more" };
  }
}

export async function submitPackRequest({ title, note, category }) {
  const res = await fetch(`${STATS_API_BASE}/api/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, note, category }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to submit request");
  return data;
}

export async function trackPageView(path) {
  try {
    await fetch(`${STATS_API_BASE}/api/analytics/hit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    });
  } catch {
    // ignore
  }
}
