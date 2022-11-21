import ReactDOM from "react-dom/client";
import Frame from "./Frame";

const rootDiv: HTMLDivElement = document.getElementById(
  "root"
) as HTMLDivElement;
const root = ReactDOM.createRoot(rootDiv);
root.render(<Frame />);
