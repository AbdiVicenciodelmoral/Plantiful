const plants = [
  {
    name: "Monstera Deliciosa",
    description: "Bold tropical leaves for bright indoor spaces.",
    price: "$24.99",
  },
  {
    name: "Snake Plant",
    description: "Low-maintenance and perfect for beginners.",
    price: "$18.99",
  },
  {
    name: "Pothos",
    description: "A fast-growing trailing plant for shelves and desks.",
    price: "$14.99",
  },
];

function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <h1>Bring Your Space to Life</h1>
          <p>Shop beautiful indoor plants, care tools, and beginner-friendly greenery.</p>

          <form className="search-box">
            <input type="text" name="q" placeholder="Search for plants..." />
            <button type="submit">Search</button>
          </form>
        </div>
      </section>

      <section className="featured">
        <h2>Featured Plants</h2>

        <div className="cards">
          {plants.map((plant) => (
            <article className="card" key={plant.name}>
              <h3>{plant.name}</h3>
              <p>{plant.description}</p>
              <span>{plant.price}</span>
            </article>
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
