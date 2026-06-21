import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export default function HomeSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/packs?search=${encodeURIComponent(trimmed)}` : "/packs");
  };

  return (
    <form className="home-search" onSubmit={handleSubmit}>
      <Search size={18} className="home-search-icon" aria-hidden="true" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search scenepacks by title or show..."
        aria-label="Search scenepacks"
      />
      <button type="submit" className="home-search-btn">
        Search
      </button>
    </form>
  );
}
