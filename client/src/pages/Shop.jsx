function Shop() {
  return (
    <main className="page-shell">
      <section className="page-heading">
        <h1>Shop Plants</h1>
        <p>
          Future plant catalog with database-backed search, filtering, plant
          detail pages, favorites, cart actions, and price-tampering lessons.
        </p>
      </section>

      <section className="toolbar-row">
        <input type="text" placeholder="Search plants..." />
        <button type="button">Search</button>
        <button type="button">Filter care level</button>
      </section>

      <section className="cards">
        <article className="card">
          <h3>Plant Detail Page</h3>
          <p>Future page for inventory data, reviews, image uploads, and IDOR tests.</p>
          <span>/plants/:id</span>
        </article>
        <article className="card">
          <h3>Favorites</h3>
          <p>Future saved plants workflow tied to user ownership.</p>
          <span>/favorites</span>
        </article>
        <article className="card">
          <h3>Cart</h3>
          <p>Future checkout workflow for price and quantity manipulation tests.</p>
          <span>/cart</span>
        </article>
      </section>
    </main>
  );
}

export default Shop;
