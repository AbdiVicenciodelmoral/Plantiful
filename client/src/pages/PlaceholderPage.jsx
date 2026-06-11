function PlaceholderPage({ actions = [], description, title }) {
  return (
    <main className="page-shell">
      <section className="page-heading">
        <h1>{title}</h1>
        <p>{description}</p>
      </section>

      {actions.length > 0 && (
        <section className="action-grid">
          {actions.map((action) => (
            <button className="action-tile" type="button" key={action}>
              {action}
            </button>
          ))}
        </section>
      )}
    </main>
  );
}

export default PlaceholderPage;
