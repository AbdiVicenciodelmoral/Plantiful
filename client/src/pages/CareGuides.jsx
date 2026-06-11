function CareGuides() {
  return (
    <main className="page-shell">
      <section className="page-heading">
        <h1>Care Guides</h1>
        <p>
          Future articles for watering, light, soil, pests, and seasonal care.
          This can become a stored XSS or unsafe HTML/Markdown rendering area.
        </p>
      </section>

      <section className="action-grid">
        <button className="action-tile" type="button">Read guide</button>
        <button className="action-tile" type="button">Search articles</button>
        <button className="action-tile" type="button">Submit care tip</button>
      </section>
    </main>
  );
}

export default CareGuides;
