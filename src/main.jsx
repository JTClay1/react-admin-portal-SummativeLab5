// main.jsx
// Vite entry. I wrap <App/> in <BrowserRouter> once here so routes work everywhere.

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  // In a real app I might add <StrictMode>, query clients, contexts, etc.
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
