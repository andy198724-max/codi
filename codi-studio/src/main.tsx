import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#1e293b",
          color: "#f8fafc",
          border: "1px solid #334155",
          borderRadius: "8px",
        },
      }}
    />
  </React.StrictMode>
);
