import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Declaration to prevent compilation errors when @types/node is missing
declare const process: any;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    base: './', // CRITICAL: This ensures assets work in a subdirectory like /repo-name/
    define: {
      // This ensures process.env.API_KEY is replaced by the actual string during build
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY),
      // Fallback for other process.env usage to prevent crashes in libraries that expect it
      'process.env': {}
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    }
  }
})