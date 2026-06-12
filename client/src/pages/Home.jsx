import { useEffect, useState } from "react";
import PlantCard from "../components/PlantCard.jsx";

function Home() {
  const [plants, setPlants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/plants")
      .then((response) => response.json())
      .then((data) => {
        setPlants(data.plants || []);
      });
  }, []);

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
        <h2>{searchTerm ? "Plant Search Results" : "Featured Plants"}</h2>

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
