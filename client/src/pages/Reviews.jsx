function Reviews() {
  return (
    <main className="page-shell">
      <section className="page-heading">
        <h1>Plant Reviews</h1>
        <p>
          Future customer reviews for stored XSS, moderation bypass, review
          ownership checks, and edit/delete IDOR practice.
        </p>
      </section>

      <section className="action-grid">
        <button className="action-tile" type="button">Write review</button>
        <button className="action-tile" type="button">Edit my review</button>
        <button className="action-tile" type="button">Report review</button>
      </section>
    </main>
  );
}

export default Reviews;
