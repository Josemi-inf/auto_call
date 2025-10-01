import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const n8nBaseUrl = env.VITE_N8N_BASE_URL;
  const n8nApiKey = env.VITE_N8N_API_KEY;

  return {
    server: {
      host: "localhost",
      port: 8080,
      proxy: n8nBaseUrl
        ? {
            "/n8n-api": {
              target: n8nBaseUrl,
              changeOrigin: true,
              secure: false,
              rewrite: (path) => path.replace(/^\/n8n-api/, '/api/v1'),
              configure: (proxy, options) => {
                proxy.on('proxyReq', (proxyReq, req, res) => {
                  // Add n8n API key header if available
                  if (n8nApiKey) {
                    proxyReq.setHeader('X-N8N-API-KEY', n8nApiKey);
                  }
                });
              },
            },
            "/n8n-webhook": {
              target: n8nBaseUrl,
              changeOrigin: true,
              secure: false,
              rewrite: (path) => path.replace(/^\/n8n-webhook/, ''),
            },
          }
        : undefined,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
