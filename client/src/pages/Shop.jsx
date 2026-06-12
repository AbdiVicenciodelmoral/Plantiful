import { useEffect, useState } from "react";
import PlantCard from "../components/PlantCard.jsx";

function Shop() {
  const [plants, setPlants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
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

  async function handleSearch(event) {
    event.preventDefault();
    setStatus("");

    const response = await fetch(`/api/plants/search?q=${encodeURIComponent(searchTerm)}`);
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error || "Plant search failed.");
      return;
    }

    setPlants(data.plants || []);
  }

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
        <button type="button" onClick={loadPlants}>Reset</button>
        <button type="button">Filter care level</button>
      </form>

      {status && <p className="error">{status}</p>}

      <section className="cards">
        {plants.map((plant) => (
          <PlantCard plant={plant} key={plant.id} />
        ))}
      </section>
    </main>
  );
}

export default Shop;
