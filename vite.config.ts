import { defineConfig } from "vite";

// Settings follow the Tauri 2 + Vite guide: fixed port, no browser auto-open,
// and src-tauri excluded from the file watcher.
export default defineConfig({
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: "127.0.0.1",
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  envPrefix: ["VITE_", "TAURI_ENV_"],
  build: {
    // WebView2 on Windows 10/11 is evergreen Chromium.
    target: "chrome120",
    sourcemap: false,
  },
});
