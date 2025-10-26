// Products.jsx
// Public catalog grid. Pulls products from json-server, supports a quick client-side filter,
// and displays sale math (base vs discounted) without asking the server to do anything fancy.

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";

const placeholder = "https://via.placeholder.com/400x225.png?text=No+Image";

export default function Products() {
  const [q, setQ] = useState(""); // lightweight client-side filter text
  const { data, loading, error } = useFetch("http://localhost:4000/products");
  const products = Array.isArray(data) ? data : [];

  // Derived list respecting the search term.
  // Note: small data set → cheap to filter on the client.
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

      {/* Simple search UX; no debounce needed for 15 rows */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          placeholder="Search by name or genre..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search products"
          style={{ width: "100%", maxWidth: 420 }}
        />
      </div>

      {/* Responsive CSS grid for product cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "1rem",
        }}
      >
        {filtered.map((p) => {
          // salePercent means the backend price is *already* discounted.
          const sale = Number(p.salePercent || 0);    // 0, 0.2, 0.3, 0.5
          const hasSale = sale > 0 && sale < 1;
          const current = Number(p.price || 0);       // "now" price
          const base = hasSale ? current / (1 - sale) : current; // reconstruct MSRP

          return (
            <article
              key={p.id}
              style={{
                border: "1px solid #ddd",
                padding: "1rem",
                borderRadius: "0.5rem",
                background: "#fff",
                color: "#000",
              }}
            >
              {/* Image frame with error fallback */}
              <div
                style={{
                  width: "100%",
                  height: 180,
                  background: "#f6f6f6",
                  border: "1px solid #eee",
                  borderRadius: "0.35rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "0.75rem",
                  overflow: "hidden",
                }}
              >
                <img
                  src={p.imageUrl || placeholder}
                  alt={p.name}
                  onError={(e) => {
                    e.currentTarget.src = placeholder;
                    e.currentTarget.onerror = null;
                  }}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                  loading="lazy"
                />
              </div>

              <h3 style={{ margin: "0 0 0.35rem", color: "#000" }}>{p.name}</h3>

              {/* Price display: if on sale, show strikethrough base + bold red current */}
              {hasSale ? (
                <p style={{ margin: "0 0 0.5rem", fontWeight: 700, color: "#000" }}>
                  <span style={{ textDecoration: "line-through", color: "#888" }}>
                    ${base.toFixed(2)}
                  </span>{" "}
                  <span style={{ color: "#ff1744", fontWeight: "bold" }}>
                    ${current.toFixed(2)} SALE PRICE
                  </span>
                </p>
              ) : (
                <p style={{ margin: "0 0 0.5rem", fontWeight: 700, color: "#000" }}>
                  ${current.toFixed(2)}
                </p>
              )}

              <p style={{ margin: "0 0 0.25rem" }}>
                <strong>Genre:</strong> {p.genre}
              </p>

              <p
                style={{
                  margin: 0,
                  color: p.quantity > 0 ? "green" : "crimson",
                  fontWeight: "bold",
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
