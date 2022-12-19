import ReactDOM from "react-dom/client";
import Frame from "./Frame";
import { registerServiceWorker } from "./registerServiceWorker";

if (navigator && navigator.serviceWorker) {
  registerServiceWorker();
}
const rootDiv: HTMLDivElement = document.getElementById(
  "root"
) as HTMLDivElement;
const root = ReactDOM.createRoot(rootDiv);
root.render(<Frame />);
