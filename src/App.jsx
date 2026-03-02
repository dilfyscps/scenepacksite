import React, { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScenepackCard from "./components/ScenepackCard";
import "./App.css";

// Import your separate scenepack arrays
import dilfyscps from "./data/dilfyscps";
import cvmscps from "./data/cvmscps";

// Combine all packs
const allPacks = [...dilfyscps, ...cvmscps];

export default function App() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("All");
  const [creatorFilter, setCreatorFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [tempSort, setTempSort] = useState(sortBy);
  const [tempCreator, setTempCreator] = useState(creatorFilter);
  const [tempCategory, setTempCategory] = useState(categoryFilter);

  const [search, setSearch] = useState("");
  const [selectedPack, setSelectedPack] = useState(null);
  const [fadeOut, setFadeOut] = useState(false);

  const currentYear = new Date().getFullYear();

  let filteredPacks = [...allPacks];

  // Sort by Latest / Old
  if (sortBy === "Latest") {
    filteredPacks = filteredPacks
      .filter(p => p.date === currentYear)
      .sort((a, b) => b.date - a.date);
  } else if (sortBy === "Old") {
    filteredPacks = filteredPacks
      .filter(p => p.date < currentYear)
      .sort((a, b) => a.date - b.date);
  }

  // Creator & Category filters
  if (creatorFilter !== "All") filteredPacks = filteredPacks.filter(p => p.creator === creatorFilter);
  if (categoryFilter !== "All") filteredPacks = filteredPacks.filter(p => p.category === categoryFilter);

  // Search
  if (search) filteredPacks = filteredPacks.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  // Modal close
  const closeModal = () => {
    setFadeOut(true);
    setTimeout(() => {
      setSelectedPack(null);
      setFadeOut(false);
    }, 300);
  };

  // Clear all filters
  const clearAll = () => {
    setTempSort("All");
    setTempCreator("All");
    setTempCategory("All");
    setSearch("");
  };

  return (
    <div className="app-container">
      <Header />

      <section className="hero-section">
        <h1>My Scenepacks</h1>
        <p>Browse all scenepacks below. Use the FILTER button to refine results.</p>
      </section>

      {/* Search + Filter */}
      <section className="search-filter-section">
        <input
          type="text"
          placeholder="Search packs by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <div className="filter-overlay-wrapper">
          <button
            type="button"
            className="hamburger-btn"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            ☰ FILTER
          </button>

          {filtersOpen && (
            <div className="filter-overlay-panel" onClick={(e) => e.stopPropagation()}>
              {/* Sort by */}
              <div className="filter-group">
                <label>Sort by:</label>
                <div className="filter-buttons-group">
                  {["All", "Latest", "Old"].map(option => (
                    <button
                      key={option}
                      type="button"
                      className={`filter-btn ${tempSort === option ? "active" : ""}`}
                      onClick={() => setTempSort(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Creator */}
              <div className="filter-group">
                <label>Creator:</label>
                <div className="filter-buttons-group">
                  {["All", "DILFYSCPS", "CVMSCPS"].map(option => (
                    <button
                      key={option}
                      type="button"
                      className={`filter-btn ${tempCreator === option ? "active" : ""}`}
                      onClick={() => setTempCreator(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="filter-group">
                <label>Category:</label>
                <div className="filter-buttons-group">
                  {["All", "Movies", "TV Shows", "Actors", "TikTokers", "PH Creators"].map(option => (
                    <button
                      key={option}
                      type="button"
                      className={`filter-btn ${tempCategory === option ? "active" : ""}`}
                      onClick={() => setTempCategory(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apply / Clear */}
              <div className="filter-buttons">
                <button
                  type="button"
                  className="apply-btn"
                  onClick={() => {
                    setSortBy(tempSort);
                    setCreatorFilter(tempCreator);
                    setCategoryFilter(tempCategory);
                    setFiltersOpen(false);
                  }}
                >
                  Apply
                </button>
                <button type="button" className="clear-btn" onClick={clearAll}>
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {filtersOpen && <div className="overlay-background" onClick={() => setFiltersOpen(false)} />}

      {/* Packs Grid */}
      <section className="featured-packs">
        <div className="packs-grid">
          {filteredPacks.map((pack, i) => (
            <div key={i} onClick={() => setSelectedPack(pack)}>
              <ScenepackCard
                title={pack.title}
                img={pack.img}
                description={pack.description}
                lastUpdated={pack.lastUpdated} // Pass lastUpdated here
              />
            </div>
          ))}
        </div>
      </section>

      <Footer />

      {/* Modal */}
      {selectedPack && (
        <div className={`modal-overlay ${fadeOut ? "fade-out" : ""}`} onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedPack.title}</h2>
            <img src={selectedPack.img} alt={selectedPack.title} />
            <p>{selectedPack.description}</p>
            {selectedPack.lastUpdated && <p><em>Last Updated: {selectedPack.lastUpdated}</em></p>}
            <a href={selectedPack.download} className="download-btn" download>
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
}