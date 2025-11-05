// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    // 1. Run the frontend dev server on port 3001
    port: 3001,
    
    // 2. This is the crucial part: The Proxy
    proxy: {
      // Any request that starts with "/api" will be forwarded
      '/api': {
        // Forward it to your backend server running on port 3000
        target: 'http://localhost:3000',
        
        // This is important for virtual hosts
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
});
