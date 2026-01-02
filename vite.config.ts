import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              // Separate chunk for heavy chart library
              charts: ['recharts'],
              // Separate chunk for AI functionality
              ai: ['@google/genai'],
              // Vendor libraries
              vendor: ['react', 'react-dom', 'react-router-dom'],
              // UI components
              ui: ['lucide-react']
            }
          }
        },
        chunkSizeWarningLimit: 600 // Increased from default 500KB
      },
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
