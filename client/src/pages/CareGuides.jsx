import { useEffect, useMemo, useState } from "react";

const categories = [
  "All",
  "Care Guides",
  "Workshop Material",
  "Seasonal Reports",
  "Community Uploads",
];

function CareGuides() {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    setStatus("");
    const response = await fetch("/api/documents");
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error || "Could not load document library.");
      return;
    }

    setDocuments(data.documents || []);
  }

  async function searchDocuments(event) {
    event.preventDefault();
    setStatus("");

    const response = await fetch(
      `/api/documents/search?q=${encodeURIComponent(searchTerm)}`
    );
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error || "Document search failed.");
      return;
    }

    setDocuments(data.documents || []);
  }

  const visibleDocuments = useMemo(() => {
    if (activeCategory === "All") {
      return documents;
    }

    return documents.filter((document) => {
      return document.category === activeCategory;
    });
  }, [activeCategory, documents]);

  return (
    <main className="page-shell">
      <section className="knowledge-hero">
        <p className="section-eyebrow">Plantiful document archive</p>
        <h1>Knowledge Center</h1>
        <p>
          Download growing guides, workshop handouts, staff reference sheets,
          invoices, and seasonal reports.
        </p>

        <div className="knowledge-actions">
          <a href="#document-library">Browse Documents</a>
          <a href="#document-search">Search Library</a>
          <button type="button">Upload Resource</button>
        </div>
      </section>

      <section className="knowledge-panel" id="document-search">
        <form className="document-search" onSubmit={searchDocuments}>
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button type="submit">Search</button>
          <button type="button" onClick={loadDocuments}>
            Reset
          </button>
        </form>

        <div className="document-categories" aria-label="Document categories">
          {categories.map((category) => (
            <button
              className={category === activeCategory ? "active" : ""}
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {status && <p className="error">{status}</p>}
      </section>

      <section className="document-library" id="document-library">
        <div className="document-library-heading">
          <div>
            <p className="section-eyebrow">Recently added</p>
            <h2>Resource Library</h2>
          </div>
          <button type="button">Import From URL</button>
        </div>

        <div className="document-table" role="table" aria-label="Knowledge Center documents">
          <div className="document-row document-row-heading" role="row">
            <span>Name</span>
            <span>Type</span>
            <span>Updated</span>
            <span>Actions</span>
          </div>

          {visibleDocuments.map((document) => (
            <article className="document-row" key={document.id} role="row">
              <div>
                <h3>{document.name}</h3>
                <p>
                  ID {document.id} - {document.category} - {document.filename}
                </p>
              </div>
              <span>{document.type}</span>
              <span>{document.uploaded}</span>
              <div className="document-actions">
                <a href={`/api/documents/${document.id}`}>View Metadata</a>
                <a href={`/documents/preview?file=${encodeURIComponent(document.file)}`}>
                  Preview
                </a>
                <a href={`/documents/download?file=${encodeURIComponent(document.file)}`}>
                  Download
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default CareGuides;
