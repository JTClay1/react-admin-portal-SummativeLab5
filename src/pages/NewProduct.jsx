import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NewProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    genre: "",
    platform: "PC",
    price: "",
    description: "",
    quantity: "",
    imageUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const genreOptions = [
    "Sports",
    "FPS",
    "Open World/RPG",
    "Action/Adventure",
    "Racing",
  ];

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.genre || !form.price) {
      setError("Name, genre, and price are required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        genre: form.genre,
        platform: "PC",
        price: Number(form.price),
        description: form.description,
        quantity: Number(form.quantity) || Math.floor(Math.random() * 20) + 5,
        imageUrl: form.imageUrl?.trim() || "",
      };

      const res = await fetch("http://localhost:4000/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      navigate("/admin"); // send employees back to admin list
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h1>Add New Game</h1>
      {error && <p role="alert" style={{ color: "crimson" }}>Error: {error}</p>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.9rem", maxWidth: 560 }}>
        <label>
          Game Name*
          <input name="name" value={form.name} onChange={onChange} placeholder="e.g., Forza Horizon 5" />
        </label>

        <label>
          Genre*
          <select name="genre" value={form.genre} onChange={onChange}>
            <option value="">Select a category</option>
            {genreOptions.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>

        <label>
          Platform (fixed)
          <input value="PC" disabled />
        </label>

        <label>
          Price (USD)* 
          <input name="price" type="number" step="0.01" value={form.price} onChange={onChange} placeholder="59.99" />
        </label>

        <label>
          Quantity
          <input name="quantity" type="number" min="0" value={form.quantity} onChange={onChange} placeholder="Leave blank for random stock" />
        </label>

        <label>
          Photo URL
          <input name="imageUrl" value={form.imageUrl} onChange={onChange} placeholder="https://…" />
        </label>

        <label>
          Description
          <textarea name="description" value={form.description} onChange={onChange} placeholder="Short blurb…" rows={4} />
        </label>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save Game"}</button>
          <button type="button" onClick={() => navigate("/admin")}>Cancel</button>
        </div>
      </form>
    </section>
  );
}
