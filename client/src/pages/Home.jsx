import { useEffect, useMemo, useState } from "react";
import PlantCard from "../components/PlantCard.jsx";

const exploreCards = [
  {
    eyebrow: "Shop",
    title: "Shop Plants",
    description: "Find something new for your collection.",
    action: "Browse",
  },
  {
    eyebrow: "Library",
    title: "Care Guides",
    description: "Practical advice, downloadable guides, and growing resources.",
    action: "Learn",
  },
  {
    eyebrow: "Classes",
    title: "Workshops",
    description: "Hands-on classes for plant lovers of every experience level.",
    action: "View Workshops",
  },
];

const workshops = [
  {
    title: "Repotting 101",
    date: "August 18",
    level: "Beginner",
  },
  {
    title: "Propagation Basics",
    date: "August 25",
    level: "Beginner",
  },
  {
    title: "Houseplant Pest Prevention",
    date: "September 7",
    level: "Intermediate",
  },
];

const testimonials = [
  {
    quote: "Arrived healthy and already pushing a new leaf.",
    name: "Abdi Vicencio Delmoral",
    plant: "Monstera Deliciosa",
  },
  {
    quote: "I totally like plants!",
    name: "Laura Messick",
    plant: "Potting Like a Master",
  },
  {
    quote: "The watering guide finally helped me stop overthinking it.",
    name: "John Doe",
    plant: "Spring Watering Schedule",
  },
];

function Home() {
  const [plants, setPlants] = useState([]);
  const [searchTerm, setSearchTerm] = useState(() => {
    return new URLSearchParams(window.location.search).get("q") || "";
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    const initialQuery = new URLSearchParams(window.location.search).get("q") || "";

    if (initialQuery) {
      searchPlants(initialQuery);
      return;
    }

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

  async function searchPlants(query) {
    setStatus("");

    const response = await fetch(`/api/plants/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error || "Plant search failed.");
      return;
    }

    setPlants(data.plants || []);
  }

  async function handleSearch(event) {
    event.preventDefault();
    const query = searchTerm.trim();
    const path = query ? `/?q=${encodeURIComponent(query)}` : "/";

    window.history.pushState(null, "", path);

    if (!query) {
      await loadPlants();
      return;
    }

    await searchPlants(query);
  }

  const featuredPlants = useMemo(() => {
    return plants.slice(0, 4);
  }, [plants]);

  const searchHeading = searchTerm
    ? `Search results for "${searchTerm}"`
    : "Featured Plants";

  return (
    <>
      <section className="home-hero">
        <div className="firefly" style={{ top: "18%", left: "72%", animationDelay: "0s" }}></div>
        <div className="firefly magic" style={{ top: "55%", left: "88%", animationDelay: "1.3s" }}></div>
        <div className="firefly" style={{ top: "78%", left: "60%", animationDelay: "2.6s" }}></div>
        <div className="firefly magic" style={{ top: "35%", left: "50%", animationDelay: "0.8s" }}></div>

        <div className="home-hero-copy">
          <p className="section-eyebrow">Plantiful</p>
          <h1>Find your next favorite plant. Learn how to help it thrive.</h1>
          <p>
            Plants, practical care advice, workshops, and resources for every
            stage of your plant-growing journey.
          </p>

          <div className="home-hero-actions">
            <a href="/shop">Explore Plants</a>
            <a href="/care-guides">Browse Care Guides</a>
          </div>
        </div>

        <div className="hero-plant-stage" aria-label="Indoor plant arrangement">
          <div className="hero-plant-orb hero-plant-orb-left"></div>
          <div className="hero-plant-orb hero-plant-orb-center"></div>
          <div className="hero-plant-orb hero-plant-orb-right"></div>
          <div className="hero-plant-stem hero-plant-stem-one"></div>
          <div className="hero-plant-stem hero-plant-stem-two"></div>
          <div className="hero-plant-stem hero-plant-stem-three"></div>
          <div className="hero-plant-pot"></div>
        </div>
      </section>

      <section className="global-search-panel">
        <form className="global-search" onSubmit={handleSearch}>
          <input
            type="text"
            name="q"
            placeholder="Search plants, care guides, workshops, reviews..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        {status && <p className="error">{status}</p>}
      </section>

      <section className="home-section explore-plantiful">
        <div className="home-section-heading">
          <p className="section-eyebrow">Start here</p>
          <h2>Explore Plantiful</h2>
        </div>

        <div className="explore-grid">
          {exploreCards.map((card) => (
            <article className="explore-card" key={card.title}>
              <p>{card.eyebrow}</p>
              <h3>{card.title}</h3>
              <span>{card.description}</span>
              <button type="button">{card.action}</button>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section featured">
        <div className="home-section-heading">
          <p className="section-eyebrow">Shop preview</p>
          {/* Intentionally vulnerable for reflected-XSS training:
              The search term comes from the URL query string and is rendered as
              raw HTML. A safe React version would be:
              <h2>{searchHeading}</h2> */}
          <h2 dangerouslySetInnerHTML={{ __html: searchHeading }} />
        </div>

        <div className="cards home-featured-grid">
          {featuredPlants.map((plant) => (
            <PlantCard plant={plant} key={plant.id} />
          ))}
        </div>

        <a className="home-center-link" href="/shop">
          Shop All Plants
        </a>
      </section>

      <section className="home-section care-spotlight">
        <div className="care-spotlight-art">
          <div className="spotlight-leaf spotlight-leaf-one"></div>
          <div className="spotlight-leaf spotlight-leaf-two"></div>
          <div className="spotlight-leaf spotlight-leaf-three"></div>
        </div>

        <div>
          <p className="section-eyebrow">Plant care spotlight</p>
          <h2>Meet the Monstera</h2>
          <p>
            Those dramatic leaves are surprisingly easy to care for. Learn
            about lighting, watering, soil, humidity, common problems, and more.
          </p>

          <div className="spotlight-facts">
            <span>Light</span>
            <span>Water</span>
            <span>Soil</span>
            <span>Common Problems</span>
          </div>

          <div className="spotlight-actions">
            <a href="/care-guides">Read the Guide</a>
            <a href="/documents/download?file=public/plantiful_monstera_care_guide.pdf">
              Download PDF
            </a>
          </div>
        </div>
      </section>

      <section className="home-section workshop-preview">
        <div className="home-section-heading">
          <p className="section-eyebrow">Upcoming workshops</p>
          <h2>Learn with other plant lovers</h2>
        </div>

        <div className="workshop-preview-grid">
          {workshops.map((workshop) => (
            <article key={workshop.title}>
              <h3>{workshop.title}</h3>
              <p>{workshop.date}</p>
              <span>{workshop.level}</span>
            </article>
          ))}
        </div>

        <a className="home-center-link" href="/workshops">
          View All Workshops
        </a>
      </section>

      <section className="home-section social-proof">
        <div className="home-section-heading">
          <p className="section-eyebrow">What growers are saying</p>
          <h2>Real notes from the Plantiful community</h2>
        </div>

        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <article key={testimonial.name}>
              <p className="stars">Customer Testimonial</p>
              <blockquote>"{testimonial.quote}"</blockquote>
              <p>
                <strong>{testimonial.name}</strong>
                <span>{testimonial.plant}</span>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section newsletter-panel">
        <p className="section-eyebrow">Get a little greener every week</p>
        <h2>Plant tips, new arrivals, and upcoming workshops.</h2>
        <form>
          <input type="email" placeholder="your@email.com" />
          <button type="button">Sign Up</button>
        </form>
      </section>

      <footer className="home-footer">
        <strong>Plantiful</strong>
        <nav>
          <a href="/shop">Shop</a>
          <a href="/care-guides">Care Guides</a>
          <a href="/workshops">Workshops</a>
          <a href="/reviews">Reviews</a>
          <a href="/contact">Contact</a>
        </nav>
        <p>Â© 2026 Plantiful</p>
      </footer>
    </>
  );
}

export default Home;
