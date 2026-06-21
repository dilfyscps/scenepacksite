import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import PackCardLink from "./PackCardLink";
import { filterPacks, CATEGORY_OPTIONS, SORT_OPTIONS } from "../utils/packUtils";

const SORT_LABELS = {
  All: "Default",
  Latest: "Newest",
  Old: "Oldest",
};

export default function PackBrowser({ packs, showResultsHeader = true, hideCategoryFilter = false }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const query = searchParams.get("search") ?? searchParams.get("q") ?? "";
    setSearch(query);
  }, [searchParams]);

  const updateSearch = (value) => {
    setSearch(value);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const trimmed = value.trim();

        if (trimmed) {
          next.set("search", trimmed);
        } else {
          next.delete("search");
          next.delete("q");
        }

        return next;
      },
      { replace: true }
    );
  };

  const filteredPacks = filterPacks(packs, {
    search,
    sortBy,
    creatorFilter: "All",
    categoryFilter: hideCategoryFilter ? "All" : categoryFilter,
  });

  const hasActiveFilters =
    search ||
    sortBy !== "All" ||
    (!hideCategoryFilter && categoryFilter !== "All");

  const clearAll = () => {
    setSortBy("All");
    setCategoryFilter("All");
    updateSearch("");
  };

  return (
    <>
      <section className="pack-toolbar">
        <div className="pack-toolbar-search">
          <Search className="pack-toolbar-search-icon" size={18} aria-hidden="true" />
          <input
            type="text"
            role="searchbox"
            aria-label="Search scenepacks"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            className="pack-toolbar-search-input"
            autoComplete="off"
          />
        </div>

        <div className="pack-filter-bar">
          {!hideCategoryFilter && (
            <div className="pack-filter-tabs" role="tablist" aria-label="Filter by category">
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={categoryFilter === option}
                  className={`pack-filter-tab${categoryFilter === option ? " pack-filter-tab--active" : ""}`}
                  onClick={() => setCategoryFilter(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          <label className="pack-filter-sort">
            <span className="pack-filter-sort-label">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort packs"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {SORT_LABELS[option] || option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="featured-packs">
        {showResultsHeader && (
          <div className="results-header">
            <span className="results-count">
              {filteredPacks.length} {filteredPacks.length === 1 ? "pack" : "packs"}
            </span>
            {hasActiveFilters && (
              <button type="button" className="pack-filter-reset" onClick={clearAll}>
                Reset filters
              </button>
            )}
          </div>
        )}

        {filteredPacks.length > 0 ? (
          <div className="packs-grid">
            {filteredPacks.map((pack) => (
              <PackCardLink key={pack.slug} pack={pack} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No packs found</h3>
            <p>Try adjusting your search or filters to find what you&apos;re looking for.</p>
            <button type="button" onClick={clearAll}>Clear filters</button>
          </div>
        )}
      </section>
    </>
  );
}
