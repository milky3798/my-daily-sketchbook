import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const params = new URLSearchParams(window.location.search);
const redirect = params.get("p");

if (redirect) {
  window.history.replaceState({}, "", redirect);
}

createRoot(document.getElementById("root")!).render(<App />);
