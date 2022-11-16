import ReactDOM from "react-dom/client";
import Frame from "./Frame";
import reportWebVitals from "./reportWebVitals";

const rootDiv: HTMLDivElement = document.getElementById(
  "root"
) as HTMLDivElement;
const root = ReactDOM.createRoot(rootDiv);
root.render(<Frame />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
