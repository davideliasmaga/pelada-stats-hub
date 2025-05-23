
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
    // Ensure we're not using any native code
    minify: false,
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    // Set format to ensure compatible output
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      },
      // Skip all plugins that might use native code
      treeshake: false,
      context: 'globalThis',
      plugins: [],
    },
    // Avoid features that might trigger native dependencies
    sourcemap: false,
    manifest: false,
    ssrManifest: false,
    watch: null,
    reportCompressedSize: false,
    cssCodeSplit: false,
    target: 'es2015',
  },
}));
