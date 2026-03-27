import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const allowedHosts = process.env.VITE_ALLOWED_HOSTS
  ? process.env.VITE_ALLOWED_HOSTS.split(",").map((host) => host.trim())
  : ["localhost", "127.0.0.1"];

const backendTarget = "https://api.telisik.org";
const backendProxy = {
  target: backendTarget,
  changeOrigin: true,
  secure: true,
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173,
    },
    allowedHosts: allowedHosts,
    proxy: {
      // Keep frontend calls same-origin during development.
      "/api": backendProxy,
      "/auth": backendProxy,
      "/articles": backendProxy,
      "/static": backendProxy,
      "/media": backendProxy,
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
