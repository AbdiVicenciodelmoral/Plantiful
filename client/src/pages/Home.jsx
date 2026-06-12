import { useEffect, useState } from "react";
import PlantCard from "../components/PlantCard.jsx";

function Home() {
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
    const path = query ? `/?q=${encodeURIComponent(query)}` : "/";

    window.history.pushState(null, "", path);

    if (!query) {
      await loadPlants();
      return;
    }

    await searchPlants(query);
  }

  const searchHeading = searchTerm
    ? `Plant Search Results for "${searchTerm}"`
    : "Featured Plants";

  return (
    <>
      <section className="hero">
        <div>
          <h1>Bring Your Space to Life</h1>
          <p>Shop beautiful indoor plants, care tools, and beginner-friendly greenery.</p>

          <form className="search-box" onSubmit={handleSearch}>
            <input
              type="text"
              name="q"
              placeholder="Search for plants..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <button type="submit">Search</button>
          </form>

          {status && <p className="error">{status}</p>}
        </div>
      </section>

      <section className="featured">
        {/* Intentionally vulnerable for reflected-XSS training:
            The search term comes from the URL query string and is rendered as
            raw HTML. A safe React version would be:
            <h2>{searchHeading}</h2> */}
        <h2 dangerouslySetInnerHTML={{ __html: searchHeading }} />

        <div className="cards">
          {plants.slice(0, 6).map((plant) => (
            <PlantCard plant={plant} key={plant.id} />
          ))}
        </div>
      </section>

      <section className="about">
        <h2>Why Plantiful?</h2>
        <p>
          Plantiful helps new and experienced plant lovers find the right plants,
          learn care basics, and create healthier indoor spaces.
        </p>
      </section>
    </>
  );
}

export default Home;
