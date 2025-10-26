// ProductDetail.jsx
// Dedicated detail page for a single product.
// I re-compute the base MSRP if a salePercent exists so users see "was $X / now $Y".
// "Back" logic: if I arrived from the Admin portal, I hard-navigate back to /admin;
// otherwise I use normal history(-1). This avoids the blank page edge-case.

import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const placeholder = "https://via.placeholder.com/800x450.png?text=No+Image";

export default function ProductDetail() {
  const { id } = useParams();          // dynamic route param
  const navigate = useNavigate();      // router imperative nav
  const location = useLocation();      // to see if we came from Admin
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Fetch on mount + whenever id changes
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`http://localhost:4000/products/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setGame(data);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Smart back: prefer returning to /admin if we came from there
  const handleBack = () => {
    if (location.state?.from === "admin") navigate("/admin", { replace: true });
    else navigate(-1);
  };

  if (loading) return <p>Loading…</p>;
  if (err) return <p role="alert">Error: {err}</p>;
  if (!game) return <p>Not found.</p>;

  // Pricing math mirrors the list view for consistency.
  const sale = Number(game.salePercent || 0); // 0–1
  const hasSale = sale > 0 && sale < 1;
  const current = Number(game.price || 0);    // discounted if sale is active
  const base = hasSale ? current / (1 - sale) : current;

  return (
    <section style={{ display: "grid", gap: "0.75rem", maxWidth: 920 }}>
      <button onClick={handleBack}>← Back</button>

      {/* Big banner shot */}
      <div className="hero">
        <img
          src={game.imageUrl || placeholder}
          alt={game.name}
          onError={(e) => {
            e.currentTarget.src = placeholder;
            e.currentTarget.onerror = null;
          }}
        />
      </div>

      <h1 style={{ margin: 0 }}>{game.name}</h1>

      {/* Compact price pill with sale styles */}
      {hasSale ? (
        <p
          style={{
            margin: 0,
            fontSize: "1.25rem",
            fontWeight: 800,
            color: "#000",
            background: "#fff",
            padding: "0.5rem 0.75rem",
            borderRadius: 10,
            width: "fit-content",
          }}
        >
          <span style={{ textDecoration: "line-through", color: "#888" }}>
            ${base.toFixed(2)}
          </span>{" "}
          <span style={{ color: "#ff1744", marginLeft: 8 }}>
            ${current.toFixed(2)} SALE PRICE
          </span>
        </p>
      ) : (
        <p
          style={{
            margin: 0,
            fontSize: "1.25rem",
            fontWeight: 800,
            color: "#000",
            background: "#fff",
            padding: "0.5rem 0.75rem",
            borderRadius: 10,
            width: "fit-content",
          }}
        >
          ${current.toFixed(2)}
        </p>
      )}

      {/* Basic metadata (kept minimal for the lab) */}
      <p style={{ margin: 0 }}>
        <strong>Platform:</strong> {game.platform}
      </p>
      <p style={{ margin: 0 }}>
        <strong>Genre:</strong> {game.genre}
      </p>
      <p style={{ margin: 0 }}>
        <strong>Description:</strong> {game.description || "—"}
      </p>
      <p style={{ margin: 0 }}>
        <strong>Availability:</strong>{" "}
        <span style={{ color: game.quantity > 0 ? "green" : "crimson" }}>
          {game.quantity > 0 ? "In Stock" : "Out of Stock"}
        </span>
      </p>
    </section>
  );
}
