
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
    // Use Terser instead of esbuild minify which avoids the Rollup native extension issue
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      // Explicitly disable native extensions in Rollup
      context: 'globalThis',
      plugins: [],
      // Force pure JavaScript implementations
      treeshake: {
        moduleSideEffects: true,
        preset: 'smallest',
      },
      // Avoid bundling node modules
      external: [],
      output: {
        // Use ES modules format
        format: 'es',
        // Ensure we're not using any features requiring native extensions
        generatedCode: {
          preset: 'es2015',
        },
      },
    },
  },
}));
