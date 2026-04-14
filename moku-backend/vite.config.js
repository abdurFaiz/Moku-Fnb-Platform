import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        laravel({
            input: [
                // Backend
                "resources/backend/sass/app.scss",
                "resources/backend/js/app.js",

                // Frontend
                "resources/frontend/css/app.css",
                "resources/frontend/src/App.jsx",
            ],
            refresh: true,
        }),
    ],
});
