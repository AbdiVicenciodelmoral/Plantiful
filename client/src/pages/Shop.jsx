import { useEffect, useState } from "react";
import PlantCard from "../components/PlantCard.jsx";

function Shop() {
  const [plants, setPlants] = useState([]);
  const [searchTerm, setSearchTerm] = useState(() => {
    return new URLSearchParams(window.location.search).get("q") || "";
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    const initialQuery = new URLSearchParams(window.location.search).get("q") || "";

    if (initialQuery) {
      searchPlants(initialQuery);
      return;
    }

    loadPlants();
  }, []);

  async function loadPlants() {
    const response = await fetch("/api/plants");
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error || "Could not load plant inventory.");
      return;
    }

    setPlants(data.plants || []);
  }

  async function searchPlants(query) {
    setStatus("");

    const response = await fetch(`/api/plants/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error || "Plant search failed.");
      return;
    }

    setPlants(data.plants || []);
  }

  async function handleSearch(event) {
    event.preventDefault();
    const query = searchTerm.trim();
    const path = query ? `/shop?q=${encodeURIComponent(query)}` : "/shop";

    window.history.pushState(null, "", path);

    if (!query) {
      await loadPlants();
      return;
    }

    await searchPlants(query);
  }

  async function handleReset() {
    setSearchTerm("");
    window.history.pushState(null, "", "/shop");
    await loadPlants();
  }

  const resultHeading = searchTerm
    ? `Inventory Search Results for "${searchTerm}"`
    : "All Plant Inventory";

  return (
    <main className="page-shell">
      <section className="page-heading">
        <h1>Shop Plants</h1>
        <p>
          Future plant catalog with database-backed search, filtering, plant
          detail pages, favorites, cart actions, and price-tampering lessons.
        </p>
      </section>

      <form className="toolbar-row" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search plants..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <button type="submit">Search</button>
        <button type="button" onClick={handleReset}>Reset</button>
        <button type="button">Filter care level</button>
      </form>

      {status && <p className="error">{status}</p>}

      {/* Intentionally vulnerable for reflected-XSS training:
          The query string is reflected into this heading as raw HTML.
          Remediation point: render {resultHeading} normally instead. */}
      <h2 dangerouslySetInnerHTML={{ __html: resultHeading }} />

      <section className="cards">
        {plants.map((plant) => (
          <PlantCard plant={plant} key={plant.id} />
        ))}
      </section>
    </main>
  );
}

export default Shop;
