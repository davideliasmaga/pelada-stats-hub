
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
    minify: 'terser',
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          supabase: ['@supabase/supabase-js'],
          utils: ['clsx', 'tailwind-merge', 'date-fns']
        }
      },
      external: [],
      treeshake: true,
      context: 'globalThis',
    },
    sourcemap: false,
    manifest: false,
    ssrManifest: false,
    watch: null,
    reportCompressedSize: false,
    cssCodeSplit: true,
    target: 'es2020',
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs'],
    },
  },
  optimizeDeps: {
    disabled: false,
    include: [
      'react', 
      'react-dom', 
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'react-router-dom',
      'lucide-react',
      'date-fns'
    ]
  },
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    jsx: 'automatic',
  },
});
