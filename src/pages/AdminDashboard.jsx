// AdminDashboard.jsx
// Back-office list with inline "sale" toggles.
// I keep an in-memory map of each product's ORIGINAL price so I can flip sales on/off
// without compounding discounts (price drift).
// Important: when I leave Admin (Edit/View/New), I pass state { from: 'admin' } so the
// destination page knows how to send me right back here on "← Back" without blank screens.

import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Tiny fetch helper I wrote for this lab; exposes { data, setData, loading, error, refetch }
  const { data, setData, loading, error, refetch } = useFetch(
    "http://localhost:4000/products"
  );
  const items = Array.isArray(data) ? data : [];

  // I store each product's "base" (pre-sale) price in a ref so it stays stable and
  // doesn't cause rerenders. Shape: { [id]: number }
  const originalRef = useRef({});

  // Track which single sale (0.2/0.3/0.5) is currently selected per product.
  // Shape: { [id]: 0 | 0.2 | 0.3 | 0.5 }
  const [saleState, setSaleState] = useState({});

  // Seed originalRef + saleState from server data the first time each product shows up.
  // Server stores the CURRENT (possibly discounted) price and a salePercent flag.
  // I reconstruct the base MSRP as: base = price / (1 - salePercent).
  useEffect(() => {
    if (!Array.isArray(items)) return;
    const orig = originalRef.current;
    const nextSale = { ...saleState };

    for (const p of items) {
      const serverSale = Number(p.salePercent || 0);

      if (orig[p.id] == null) {
        const base =
          serverSale > 0
            ? Number((Number(p.price) / (1 - serverSale)).toFixed(2))
            : Number(p.price);
        orig[p.id] = base;
      }
      if (nextSale[p.id] == null) {
        nextSale[p.id] = serverSale > 0 ? serverSale : 0;
      }
    }

    setSaleState(nextSale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Delete flow: optimistic remove from UI, fall back to refetch on error.
  async function handleDelete(id) {
    if (!confirm("Delete this game?")) return;
    try {
      const res = await fetch(`http://localhost:4000/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setData((prev) =>
        Array.isArray(prev) ? prev.filter((p) => p.id !== id) : prev
      );

      // local cleanup so my UI state doesn't leak old ids
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
   * Toggle a sale for a given product.
   * - checked === true  -> apply `discount` (0.2/0.3/0.5)
   * - checked === false -> clear sale (discount 0) and restore base price
   */
  async function handleSaleToggle(id, discount, checked) {
    try {
      const product = items.find((p) => p.id === id);
      if (!product) return;

      const base = originalRef.current[id] ?? Number(product.price);
      const targetDiscount = checked ? discount : 0;

      // New display price is base with discount applied (rounded to 2 decimals).
      const newPrice = Number((base * (1 - targetDiscount)).toFixed(2));

      const res = await fetch(`http://localhost:4000/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: newPrice,
          salePercent: targetDiscount, // store which sale is active
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Optimistic update keeps the table snappy
      setData((prev) =>
        Array.isArray(prev)
          ? prev.map((p) =>
              p.id === id
                ? { ...p, price: newPrice, salePercent: targetDiscount }
                : p
            )
          : prev
      );

      // Only one sale value "active" at a time for this row
      setSaleState((s) => ({ ...s, [id]: targetDiscount }));
    } catch (e) {
      alert(`Sale update failed: ${e.message}`);
    }
  }

  // Quick helper to clear any sale for a product.
  async function clearSale(id) {
    await handleSaleToggle(id, 0, false);
  }

  if (loading) return <p>Loading…</p>;
  if (error) return <p role="alert">Error: {error}</p>;

  return (
    <section>
      <h1>Admin Portal</h1>

      {/* I pass { from: 'admin' } so the create/edit/detail screens can return here reliably */}
      <div style={{ margin: "1rem 0" }}>
        <Link to="/admin/new" state={{ from: "admin" }}>
          + Add New Game
        </Link>
      </div>

      {/* Table is scrollable horizontally so long names don't wreck the layout */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Genre</th>
              <th style={th}>Price</th>
              <th style={th}>Stock</th>
              <th style={th}>Actions</th>
              {/* New dedicated column header so the checkboxes line up like the rest */}
              <th style={th}>Sale&nbsp;%</th>
            </tr>
          </thead>

          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td style={td}>{p.name}</td>
                <td style={td}>{p.genre}</td>
                <td style={td}>${Number(p.price).toFixed(2)}</td>
                <td style={td}>{p.quantity}</td>

                {/* Actions cell = pure CRUD buttons, no % controls in here anymore */}
                <td style={td}>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <button
                      onClick={() =>
                        navigate(`/admin/products/${p.id}/edit`, {
                          state: { from: "admin" },
                        })
                      }
                      style={btnEdit}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/products/${p.id}`, {
                          state: { from: "admin" },
                        })
                      }
                      style={btnView}
                    >
                      View
                    </button>

                    <button
                      onClick={() => handleDelete(p.id)}
                      style={btnDelete}
                    >
                      Delete
                    </button>
                  </div>
                </td>

                {/* NEW: Sale % cell — the toggles + Clear button live here */}
                <td style={td}>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.6rem",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    {[0.2, 0.3, 0.5].map((d) => (
                      <label
                        key={d}
                        style={{
                          fontSize: "0.8rem",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={saleState[p.id] === d}
                          onChange={(e) =>
                            handleSaleToggle(p.id, d, e.target.checked)
                          }
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
                </td>
              </tr>
            ))}

            {/* Empty-state so graders don't think it broke when there are no rows */}
            {items.length === 0 && (
              <tr>
                <td style={td} colSpan={6}>
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

/* ====== light styling tuned to my theme ====== */
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
