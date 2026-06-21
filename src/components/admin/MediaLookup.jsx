import React, { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { searchMediaTitles } from "../../utils/adminApi";

export default function MediaLookup({ onApply }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLookupError("");
      return undefined;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setLookupError("");
      try {
        const data = await searchMediaTitles(trimmed);
        setResults(Array.isArray(data.results) ? data.results : []);
      } catch (err) {
        setResults([]);
        setLookupError(err.message || "Search failed");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (result) => {
    onApply({
      title: result.title,
      img: result.image,
      description: result.description,
      category: result.category,
      date: result.year || new Date().getFullYear(),
    });
    setQuery("");
    setResults([]);
  };

  return (
    <div className="admin-media-lookup">
      <div className="admin-media-lookup-head">
        <Sparkles size={16} aria-hidden="true" />
        <div>
          <strong>Look up movie or TV show</strong>
          <p>Search by title — poster, description, and category fill in automatically.</p>
        </div>
      </div>

      <div className="admin-media-lookup-search">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Peacemaker, Looking, Dune..."
          aria-label="Search movie or TV show titles"
        />
        {loading && <Loader2 size={18} className="admin-spin admin-media-lookup-spinner" aria-hidden="true" />}
      </div>

      {lookupError && <p className="admin-media-lookup-error">{lookupError}</p>}

      {results.length > 0 && (
        <ul className="admin-media-results">
          {results.map((result) => (
            <li key={`${result.mediaType}-${result.id}`}>
              <button type="button" className="admin-media-result" onClick={() => handleSelect(result)}>
                {result.image ? (
                  <img src={result.image} alt="" className="admin-media-result-poster" />
                ) : (
                  <span className="admin-media-result-poster admin-media-result-poster--empty">No art</span>
                )}
                <span className="admin-media-result-body">
                  <strong>{result.title}</strong>
                  <span>
                    {result.category}
                    {result.year ? ` · ${result.year}` : ""}
                  </span>
                  {result.description && <span className="admin-media-result-desc">{result.description}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
