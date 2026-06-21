const ANNOUNCEMENT_KEY = "announcement";
const ANALYTICS_KEY = "analytics";

const DEFAULT_ANNOUNCEMENT = {
  enabled: false,
  message: "",
  link: "",
  linkLabel: "Learn more",
};

export async function readAnnouncement(kv) {
  const raw = await kv.get(ANNOUNCEMENT_KEY);
  if (!raw) return DEFAULT_ANNOUNCEMENT;
  try {
    return { ...DEFAULT_ANNOUNCEMENT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ANNOUNCEMENT;
  }
}

export async function writeAnnouncement(kv, data) {
  const next = {
    enabled: Boolean(data.enabled),
    message: typeof data.message === "string" ? data.message.trim().slice(0, 200) : "",
    link: typeof data.link === "string" ? data.link.trim().slice(0, 300) : "",
    linkLabel:
      typeof data.linkLabel === "string" ? data.linkLabel.trim().slice(0, 40) : "Learn more",
  };
  await kv.put(ANNOUNCEMENT_KEY, JSON.stringify(next));
  return next;
}

export async function readAnalytics(kv) {
  const raw = await kv.get(ANALYTICS_KEY);
  if (!raw) return { totalViews: 0, paths: {}, last7Days: {} };
  try {
    const parsed = JSON.parse(raw);
    return {
      totalViews: parsed.totalViews || 0,
      paths: parsed.paths || {},
      last7Days: parsed.last7Days || {},
    };
  } catch {
    return { totalViews: 0, paths: {}, last7Days: {} };
  }
}

export async function recordPageView(kv, path) {
  const safePath = typeof path === "string" && path.startsWith("/") ? path.slice(0, 120) : "/";
  const analytics = await readAnalytics(kv);
  const day = new Date().toISOString().slice(0, 10);

  analytics.totalViews += 1;
  analytics.paths[safePath] = (analytics.paths[safePath] || 0) + 1;
  analytics.last7Days[day] = (analytics.last7Days[day] || 0) + 1;

  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  for (const key of Object.keys(analytics.last7Days)) {
    if (new Date(key).getTime() < cutoff) {
      delete analytics.last7Days[key];
    }
  }

  await kv.put(ANALYTICS_KEY, JSON.stringify(analytics));
  return analytics;
}

export { ANNOUNCEMENT_KEY, ANALYTICS_KEY };
