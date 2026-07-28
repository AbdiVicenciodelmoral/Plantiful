const workshops = [
  {
    id: "potting-master",
    title: "Potting Like a Master",
    schedule: "Every Friday",
    description:
      "Learn soil mixes, drainage, repotting timing, and how to move plants without shocking the roots.",
  },
  {
    id: "veggie-guide",
    title: "Grow Them Big! Guide to Veggies",
    schedule: "Thursdays and Saturdays",
    description:
      "A beginner-friendly vegetable growing class focused on containers, light, watering, and feeding.",
  },
  {
    id: "urban-foraging",
    title: "Urban Foraging and Trimming",
    schedule: "Mondays and Wednesdays",
    description:
      "Practice identifying useful plants, trimming safely, and keeping urban greenery healthy.",
  },
];

function Workshops({ user, onNavigate, onRequireLogin }) {
  function handleWorkshopClick(workshop) {
    if (!user) {
      onRequireLogin(
        `Please log in or create an account before registering for ${workshop.title}.`
      );
      return;
    }

    if (workshop.id === "potting-master") {
      onNavigate("workshopPotting");
    }
  }

  return (
    <main className="page-shell">
      <section className="page-heading">
        <h1>Classes & Workshops</h1>
        <p>
          Join beginner-friendly plant classes, reserve a seat, and come back
          later to manage your workshop signups from your account.
        </p>
      </section>

      <section className="workshop-grid" aria-label="Available workshops">
        {workshops.map((workshop) => {
          const hasDetailPage = workshop.id === "potting-master";

          return (
            <article className="workshop-card" key={workshop.id}>
              <p className="workshop-schedule">{workshop.schedule}</p>
              <h2>{workshop.title}</h2>
              <p>{workshop.description}</p>

              <button
                className="workshop-signup"
                disabled={!hasDetailPage}
                type="button"
                onClick={() => handleWorkshopClick(workshop)}
              >
                {hasDetailPage ? "View class" : "Coming soon"}
              </button>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default Workshops;
