
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Use Terser instead of esbuild minify
    minify: false, // Disable minification completely for now
    rollupOptions: {
      // Force Rollup to use only pure JavaScript
      context: 'window',
      treeshake: false, // Disable tree-shaking to avoid optimizations that might use native code
      external: [], 
      output: {
        format: 'es',
        // Ensure using only pure JS features
        generatedCode: {
          preset: 'es2015',
        },
      },
    },
    // Disable sourcemap for now
    sourcemap: false,
  },
}));
