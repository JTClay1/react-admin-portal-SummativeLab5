// AdminDashboard.jsx
// Back-office list with inline "sale" toggles. I keep an in-memory map of each product's
// original price so I can flip sales on/off without price drift from repeated discounts.
// Also: when I leave this page (Edit/View/New), I pass state { from: 'admin' } so the
// destination page knows how to send me back here reliably.

import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data, setData, loading, error, refetch } = useFetch(
    "http://localhost:4000/products"
  );
  const items = Array.isArray(data) ? data : [];

  // Stable original prices per product id; never overwritten after seed.
  // Why a ref? because I don't want rerenders every time this map changes.
  const originalRef = useRef({}); // { [id]: number }

  // Track active sale % per product for controlled checkboxes.
  const [saleState, setSaleState] = useState({}); // { [id]: 0 | 0.2 | 0.3 | 0.5 }

  // Seed originalRef + saleState from server data on first sight of each id.
  // This lets me reconstruct base price when a sale is active (since server price is discounted).
  useEffect(() => {
    if (!Array.isArray(items)) return;
    const orig = originalRef.current;
    const nextSale = { ...saleState };

    for (const p of items) {
      const serverSale = Number(p.salePercent || 0);

      // If we haven't seen this product before, compute its base (pre-sale) price.
      if (orig[p.id] == null) {
        // If the server says a sale is active, reconstruct base price = discounted / (1 - sale)
        const base =
          serverSale > 0 ? Number((p.price / (1 - serverSale)).toFixed(2)) : Number(p.price);
        orig[p.id] = base;
      }

      // Initialize sale state from server on first pass
      if (nextSale[p.id] == null) {
        nextSale[p.id] = serverSale > 0 ? serverSale : 0;
      }
    }

    setSaleState(nextSale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Delete a product and optimistically remove from local state.
  async function handleDelete(id) {
    if (!confirm("Delete this game?")) return;
    try {
      const res = await fetch(`http://localhost:4000/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setData((prev) => (Array.isArray(prev) ? prev.filter((p) => p.id !== id) : prev));

      // cleanup local state
      const s = { ...saleState };
      delete s[id];
      setSaleState(s);
      delete originalRef.current[id];
    } catch (e) {
      alert(`Failed to delete: ${e.message}`);
      refetch();
    }
  }

  /**
   * Apply or remove a sale for a given product.
   * - If checked === true  -> apply `discount` (0.2/0.3/0.5)
   * - If checked === false -> restore original price (discount 0)
   */
  async function handleSaleToggle(id, discount, checked) {
    try {
      const product = items.find((p) => p.id === id);
      if (!product) return;

      const base = originalRef.current[id] ?? Number(product.price);
      const targetDiscount = checked ? discount : 0;
      const newPrice = Number((base * (1 - targetDiscount)).toFixed(2));

      const res = await fetch(`http://localhost:4000/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: newPrice,
          salePercent: targetDiscount, // persist which sale is active
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Update list immediately (optimistic UI)
      setData((prev) =>
        Array.isArray(prev)
          ? prev.map((p) =>
              p.id === id ? { ...p, price: newPrice, salePercent: targetDiscount } : p
            )
          : prev
      );

      // Update UI sale state (only that discount active)
      setSaleState((s) => ({ ...s, [id]: targetDiscount }));
    } catch (e) {
      alert(`Sale update failed: ${e.message}`);
    }
  }

  // Convenience: clear any sale for a product
  async function clearSale(id) {
    await handleSaleToggle(id, 0, false);
  }

  if (loading) return <p>Loading…</p>;
  if (error) return <p role="alert">Error: {error}</p>;

  return (
    <section>
      <h1>Admin Portal</h1>

      {/* Top CTA to add records — I pass { from: 'admin' } so the form page knows how to "Back" to here */}
      <div style={{ margin: "1rem 0" }}>
        <Link to="/admin/new" state={{ from: "admin" }}>
          + Add New Game
        </Link>
      </div>

      {/* Scrollable table container so the page doesn't jump around */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Genre</th>
              <th style={th}>Price</th>
              <th style={th}>Stock</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td style={td}>{p.name}</td>
                <td style={td}>{p.genre}</td>
                <td style={td}>${Number(p.price).toFixed(2)}</td>
                <td style={td}>{p.quantity}</td>
                <td style={td}>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                    {/* Basic CRUD buttons — I pass state so the next page can return to /admin even if history is funky */}
                    <button
                      onClick={() =>
                        navigate(`/admin/products/${p.id}/edit`, { state: { from: "admin" } })
                      }
                      style={btnEdit}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/products/${p.id}`, { state: { from: "admin" } })
                      }
                      style={btnView}
                    >
                      View
                    </button>
                    <button onClick={() => handleDelete(p.id)} style={btnDelete}>
                      Delete
                    </button>

                    {/* Sale toggles — designed to be mutually exclusive per product */}
                    <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                      {[0.2, 0.3, 0.5].map((d) => (
                        <label
                          key={d}
                          style={{
                            fontSize: "0.8rem",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={saleState[p.id] === d}
                            onChange={(e) => handleSaleToggle(p.id, d, e.target.checked)}
                            style={{ marginRight: "0.25rem" }}
                          />
                          {d * 100}%
                        </label>
                      ))}
                      <button
                        onClick={() => clearSale(p.id)}
                        style={{ ...btnGhost, padding: "0.25rem 0.6rem" }}
                        title="Clear sale"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td style={td} colSpan={5}>
                  <em>No products yet.</em>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ====== light styling tuned to your theme ====== */
const th = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  padding: "0.5rem",
  color: "#fff",
};
const td = {
  borderBottom: "1px solid #333",
  padding: "0.5rem",
  color: "#fff",
};

const btnEdit = {
  background: "linear-gradient(90deg, #ff5f6d, #ffc371)",
  border: "none",
  color: "#fff",
  padding: "0.3rem 0.75rem",
  borderRadius: 4,
  cursor: "pointer",
};
const btnView = {
  background: "#5f8dff",
  border: "none",
  color: "#fff",
  padding: "0.3rem 0.75rem",
  borderRadius: 4,
  cursor: "pointer",
};
const btnDelete = {
  background: "#b00020",
  border: "none",
  color: "#fff",
  padding: "0.3rem 0.75rem",
  borderRadius: 4,
  cursor: "pointer",
};
const btnGhost = {
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.35)",
  color: "#fff",
  borderRadius: 6,
  cursor: "pointer",
};
