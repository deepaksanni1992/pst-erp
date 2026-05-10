import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const apiProxy = {
  "/api": {
    target: "http://127.0.0.1:5001",
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    strictPort: false,
    // `vite` dev: same-origin `/api/*` → local Express on PORT (default 5001; backend/.env + S3).
    proxy: apiProxy,
  },
  preview: {
    // `vite preview` uses production build but still needs /api → local backend when testing on localhost.
    proxy: apiProxy,
  },
});
