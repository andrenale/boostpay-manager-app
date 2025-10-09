import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ClientsProvider } from "./contexts/ClientsContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClientsProvider>
      <App />
    </ClientsProvider>
  </StrictMode>
);
