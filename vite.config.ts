import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("@supabase")) return "supabase";
          if (id.includes("@tanstack/react-query")) return "query";
          if (id.includes("react-router-dom")) return "router";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("react-hook-form") || id.includes("@hookform")) return "forms";
          if (id.includes("leaflet") || id.includes("react-leaflet")) return "maps";
          if (id.includes("recharts")) return "charts";
          if (id.includes("date-fns")) return "date-fns";

          return "vendor";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
