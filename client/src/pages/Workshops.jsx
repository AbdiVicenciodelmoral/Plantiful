function Workshops() {
  return (
    <main className="page-shell">
      <section className="page-heading">
        <h1>Classes & Workshops</h1>
        <p>
          Future workshop listings, class signup, appointment changes, and
          overbooking or IDOR testing around signup IDs.
        </p>
      </section>

      <section className="action-grid">
        <button className="action-tile" type="button">View workshop</button>
        <button className="action-tile" type="button">Reserve seat</button>
        <button className="action-tile" type="button">Manage signup</button>
      </section>
    </main>
  );
}

export default Workshops;
