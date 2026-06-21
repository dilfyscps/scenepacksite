const TMDB_BASE = "https://api.themoviedb.org/3";
const POSTER_BASE = "https://image.tmdb.org/t/p/w500";

function mapResult(item) {
  const isMovie = item.media_type === "movie";
  const title = isMovie ? item.title : item.name;
  const date = isMovie ? item.release_date : item.first_air_date;
  const year = date ? Number(date.slice(0, 4)) : null;

  return {
    id: item.id,
    mediaType: item.media_type,
    title: title || "Untitled",
    year: Number.isFinite(year) ? year : null,
    image: item.poster_path ? `${POSTER_BASE}${item.poster_path}` : "",
    description: item.overview?.trim() || "",
    category: isMovie ? "Movies" : "TV Shows",
  };
}

export async function searchMedia(apiKey, query) {
  const params = new URLSearchParams({
    api_key: apiKey,
    query,
    include_adult: "false",
  });

  const res = await fetch(`${TMDB_BASE}/search/multi?${params}`);
  if (!res.ok) {
    throw new Error("Media search failed");
  }

  const data = await res.json();

  return (data.results || [])
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .slice(0, 10)
    .map(mapResult);
}
