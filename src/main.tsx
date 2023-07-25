import { StrictMode } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

import { ConvexProvider, ConvexReactClient } from "convex/react";
const address = import.meta.env.VITE_CONVEX_URL;
const convex = new ConvexReactClient(address);

ReactDOM.render(
  <StrictMode>
    {/* @snippet start provideClient */}
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
    {/* @snippet end provideClient */}
  </StrictMode>,
  document.getElementById("root")
);
