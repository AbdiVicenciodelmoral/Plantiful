function PlantCard({ plant }) {
  return (
    <article className="card plant-card">
      <img className="plant-image" src={plant.image_url} alt={plant.name} />
      <h3>{plant.name}</h3>
      <p>{plant.description}</p>
      <dl className="plant-meta">
        <div>
          <dt>Care</dt>
          <dd>{plant.care_level}</dd>
        </div>
        <div>
          <dt>Light</dt>
          <dd>{plant.light}</dd>
        </div>
        <div>
          <dt>Water</dt>
          <dd>{plant.water}</dd>
        </div>
      </dl>
      <span>${Number(plant.price).toFixed(2)}</span>
    </article>
  );
}

export default PlantCard;
