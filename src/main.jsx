import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "bulma/css/bulma.min.css"
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    {/* <></> This is what's caled root element it is required for react jsx .. will see later
      it is not some typical
    */}
  </React.StrictMode>
);


