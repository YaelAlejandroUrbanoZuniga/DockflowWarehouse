import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-radix': [
            '@radix-ui/react-dialog',
          ],
          'vendor-charts': ['recharts'],
          'vendor-motion': ['motion'],
          'vendor-misc': ['jotai', 'qrcode', 'jsqr', 'tailwindcss-animate', 'class-variance-authority', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },
});
