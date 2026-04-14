import React from "react";
import * as ReactDOM from "react-dom/client";
import { AppRoutes } from "./routes/AppRoutes";

function App() {
    return (
        <div className="app">
            <AppRoutes />
        </div>
    );
}

// Create root and render
const rootElement = document.getElementById("app");
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}

export default App;
