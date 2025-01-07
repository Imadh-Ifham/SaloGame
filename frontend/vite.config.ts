import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },
  },
  clearScreen: false,
  logLevel: "info",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
