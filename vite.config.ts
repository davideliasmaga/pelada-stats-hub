
import { defineConfig } from "vite";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    {
      name: 'react',
      apply: 'build',
      config() {
        return {
          esbuild: {
            jsx: 'automatic',
          },
        };
      },
    },
    componentTagger(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: false,
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
      external: [],
      treeshake: false,
      context: 'globalThis',
    },
    sourcemap: false,
    manifest: false,
    ssrManifest: false,
    watch: null,
    reportCompressedSize: false,
    cssCodeSplit: false,
    target: 'es2015',
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs'],
    },
  },
  optimizeDeps: {
    disabled: false,
    include: ['react', 'react-dom']
  },
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    jsx: 'automatic',
  },
});
