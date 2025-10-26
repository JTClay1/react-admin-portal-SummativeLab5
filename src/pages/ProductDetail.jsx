// ProductDetail.jsx
// Displays a single game's full details. Updated for the dark theme so the image
// sits on a black-to-dark-gray gradient background instead of a bright white block.

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const placeholder = "https://via.placeholder.com/800x450.png?text=No+Image";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Fetch the specific product
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

  if (loading) return <p>Loading…</p>;
  if (err) return <p role="alert">Error: {err}</p>;
  if (!game) return <p>Not found.</p>;

  const sale = Number(game.salePercent || 0);
  const hasSale = sale > 0 && sale < 1;
  const current = Number(game.price || 0);
  const base = hasSale ? current / (1 - sale) : current;

  return (
    <section className="product-detail">
      <button onClick={() => navigate(-1)} className="btn-ghost">
        ← Back
      </button>

      {/* HERO IMAGE AREA */}
      <div className="hero dark-hero">
        <img
          src={game.imageUrl || placeholder}
          alt={game.name}
          onError={(e) => {
            e.currentTarget.src = placeholder;
            e.currentTarget.onerror = null;
          }}
        />
      </div>

      {/* INFO AREA */}
      <h1>{game.name}</h1>

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

      <p>
        <strong>Platform:</strong> {game.platform}
      </p>
      <p>
        <strong>Genre:</strong> {game.genre}
      </p>
      <p>
        <strong>Description:</strong> {game.description || "—"}
      </p>
      <p>
        <strong>Availability:</strong>{" "}
        <span style={{ color: game.quantity > 0 ? "limegreen" : "crimson" }}>
          {game.quantity > 0 ? "In Stock" : "Out of Stock"}
        </span>
      </p>
    </section>
  );
}
