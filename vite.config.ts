
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
    // Disable all minification to avoid native code issues
    minify: false,
    rollupOptions: {
      // Force Rollup to use only pure JavaScript
      context: 'globalThis', // Use globalThis instead of window for broader compatibility
      // Completely disable treeshaking
      treeshake: false,
      // Don't treat any modules as external
      external: [],
      output: {
        // Use ES modules format
        format: 'es',
        // Simplify code generation to avoid advanced features
        generatedCode: {
          preset: 'es2015',
        },
        // Disable code optimizations that might use native code
        compact: false,
        hoistTransitiveImports: false,
        manualChunks: undefined,
        // Skip any plugin hooks that might use native code
        plugins: [],
      },
    },
    // Disable sourcemap generation
    sourcemap: false,
    // Don't use watch mode (which might use native file watchers)
    watch: null,
    // Disable all runtime checks
    reportCompressedSize: false,
    cssCodeSplit: false,
    // Explicitly set the target to ensure no modern features are used
    target: 'es2015',
  },
}));
