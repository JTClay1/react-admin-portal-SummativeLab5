// EditProduct.jsx
// Admin edit form. Loads the record on mount, hydrates the form, then PATCHes only the fields we track.
// Minimal validation to mirror the "create" form behavior.
// "Back" logic uses the same state flag pattern as ProductDetail so returning to Admin is reliable.

import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    genre: "",
    platform: "PC",
    price: "",
    quantity: "",
    description: "",
    imageUrl: "",
  });

  const genreOptions = [
    "Sports",
    "FPS",
    "Open World/RPG",
    "Action/Adventure",
    "Racing",
  ];

  // Fetch current product and populate the form once
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`http://localhost:4000/products/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setForm({
          name: data.name ?? "",
          genre: data.genre ?? "",
          platform: "PC",
          price: data.price ?? "",
          quantity: data.quantity ?? "",
          description: data.description ?? "",
          imageUrl: data.imageUrl ?? "",
        });
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);

    if (!form.name || !form.genre || form.price === "") {
      setErr("Name, genre, and price are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        genre: form.genre,
        platform: "PC",
        price: Number(form.price),
        quantity: Number(form.quantity) || 0,
        description: form.description,
        imageUrl: form.imageUrl?.trim() || "",
      };

      const res = await fetch(`http://localhost:4000/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      navigate("/admin"); // UX: bounce back to the list after save
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  // Smart back: prefer returning to /admin if we came from there
  const handleBack = () => {
    if (location.state?.from === "admin") navigate("/admin", { replace: true });
    else navigate(-1);
  };

  if (loading) return <p>Loading…</p>;
  if (err) return <p role="alert" style={{ color: "crimson" }}>Error: {err}</p>;

  return (
    <section>
      <button onClick={handleBack}>← Back</button>
      <h1>Edit Product</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.9rem", maxWidth: 560 }}>
        <label>
          Game Name*
          <input name="name" value={form.name} onChange={onChange} />
        </label>

        <label>
          Genre*
          <select name="genre" value={form.genre} onChange={onChange}>
            <option value="">Select a category</option>
            {genreOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        <label>
          Platform (fixed)
          <input value="PC" disabled />
        </label>

        <label>
          Price (USD)*
          <input
            name="price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={onChange}
          />
        </label>

        <label>
          Quantity
          <input
            name="quantity"
            type="number"
            min="0"
            value={form.quantity}
            onChange={onChange}
          />
        </label>

        <label>
          Photo URL
          <input
            name="imageUrl"
            value={form.imageUrl}
            onChange={onChange}
            placeholder="https://…"
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            rows={4}
            value={form.description}
            onChange={onChange}
          />
        </label>

        {err && (
          <p role="alert" style={{ color: "crimson" }}>
            Error: {err}
          </p>
        )}

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button type="button" onClick={() => navigate("/admin")}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
