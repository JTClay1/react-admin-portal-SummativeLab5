// App.jsx
// Bootcamp lab note: This is the top-level router + layout shell.
// I keep the site nav/footer here and swap pages via <Routes>.
// I split customer-facing and admin routes so it's obvious what's public vs staff tools.

import { Routes, Route, Link } from "react-router-dom";
import Landing from "./pages/Landing";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import NewProduct from "./pages/NewProduct";
import EditProduct from "./pages/EditProduct";
import AdminDashboard from "./pages/AdminDashboard";
import "./index.css";

function App() {
  return (
    <div className="App">
      {/* Sticky site-wide nav — simple <Link>s because we don't need fancy menus */}
      <header className="site-nav">
        <nav className="site-nav__inner">
          {/* Brand doubles as a Home link */}
          <Link to="/" className="brand">Joystick: PC Paradise</Link>

          {/* Super basic primary nav */}
          <div className="site-nav__links">
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>
            <Link to="/admin">Admin Portal</Link>
          </div>
        </nav>
      </header>

      {/* All page content gets swapped here by the router */}
      <main className="page-container">
        <Routes>
          {/* Customer-facing pages (no auth walls in this lab) */}
          <Route path="/" element={<Landing />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* Admin-only (assume "trusted device" for lab purposes) */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/new" element={<NewProduct />} />
          <Route path="/admin/products/:id/edit" element={<EditProduct />} />

          {/* Back-compat routes: if a teammate bookmarks an older path, still works */}
          <Route path="/products/new" element={<NewProduct />} />
          <Route path="/products/:id/edit" element={<EditProduct />} />
        </Routes>
      </main>

      {/* Simple footer — pulled current year dynamically so I don’t forget later */}
      <footer className="site-footer">
        <p>© {new Date().getFullYear()} Joystick: PC Paradise</p>
      </footer>
    </div>
  );
}

export default App;
