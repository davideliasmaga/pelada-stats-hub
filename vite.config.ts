
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
    // Complete JavaScript build without native dependencies
    minify: false,
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    // Ensure compatibility
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
      // Disable all plugins that might use native code
      plugins: [],
      // Disable tree-shaking
      treeshake: false,
      // Use global context
      context: 'globalThis',
    },
    // Disable all features that might trigger native dependencies
    sourcemap: false,
    manifest: false,
    ssrManifest: false,
    watch: null,
    reportCompressedSize: false,
    cssCodeSplit: false,
    target: 'es2015',
  },
  optimizeDeps: {
    // Disable dependency optimization
    disabled: true
  },
  esbuild: {
    // Disable minification through esbuild
    minify: false,
    target: 'es2015'
  },
}));
