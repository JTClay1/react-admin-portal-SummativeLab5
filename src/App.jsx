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
      <header className="site-nav">
        <nav className="site-nav__inner">
          <Link to="/" className="brand">Joystick: PC Paradise</Link>
          <div className="site-nav__links">
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>
            <Link to="/admin">Admin Portal</Link>
          </div>
        </nav>
      </header>

      <main className="page-container">
        <Routes>
          {/* Customer-facing */}
          <Route path="/" element={<Landing />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* Admin-only */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/new" element={<NewProduct />} />
          <Route path="/admin/products/:id/edit" element={<EditProduct />} />

          {/* Back-compat (if you have older links) */}
          <Route path="/products/new" element={<NewProduct />} />
          <Route path="/products/:id/edit" element={<EditProduct />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} Joystick: PC Paradise</p>
      </footer>
    </div>
  );
}

export default App;
