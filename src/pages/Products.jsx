// Products.jsx
// Public catalog grid with dark, compact product cards (arcade theme, no pattern).

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";

const placeholder = "https://via.placeholder.com/400x225.png?text=No+Image";

export default function Products() {
  const [q, setQ] = useState("");
  const { data, loading, error } = useFetch("http://localhost:4000/products");
  const products = Array.isArray(data) ? data : [];

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) =>
      [p.name, p.genre, p.platform].some((v) =>
        String(v).toLowerCase().includes(term)
      )
    );
  }, [q, products]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p role="alert">Error: {error}</p>;

  return (
    <section>
      <h1>In-Store Catalog</h1>

      {/* Quick search box */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          placeholder="Search by name or genre..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search products"
          style={{ width: "100%", maxWidth: 420 }}
        />
      </div>

      <div
        className="product-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        {filtered.map((p) => {
          const sale = Number(p.salePercent || 0);
          const hasSale = sale > 0 && sale < 1;
          const current = Number(p.price || 0);
          const base = hasSale ? current / (1 - sale) : current;

          return (
            <article key={p.id} className="product-card dark-card">
              <div className="thumb">
                <img
                  src={p.imageUrl || placeholder}
                  alt={p.name}
                  onError={(e) => {
                    e.currentTarget.src = placeholder;
                    e.currentTarget.onerror = null;
                  }}
                  loading="lazy"
                />
              </div>

              <h3>{p.name}</h3>

              {hasSale ? (
                <p className="price price--sale">
                  <span className="price__base">${base.toFixed(2)}</span>{" "}
                  <span className="price__sale">
                    ${current.toFixed(2)} SALE PRICE
                  </span>
                </p>
              ) : (
                <p className="price">${current.toFixed(2)}</p>
              )}

              <p style={{ margin: "0 0 0.25rem" }}>
                <strong>Genre:</strong> {p.genre}
              </p>

              <p
                style={{
                  margin: 0,
                  color: p.quantity > 0 ? "limegreen" : "crimson",
                  fontWeight: 700,
                }}
              >
                {p.quantity > 0 ? "In Stock" : "Out of Stock"}
              </p>

              <div style={{ marginTop: "0.75rem" }}>
                <Link to={`/products/${p.id}`}>View Details</Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
