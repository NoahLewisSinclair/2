import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => ({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        id: '/', name: 'Dayframe Productivity', short_name: 'Dayframe',
        description: 'Plan your day. Break down your work. Focus on one step at a time.',
        theme_color: '#07549A', background_color: '#F8F9FA', display: 'standalone', start_url: '/', scope: '/',
        icons: [{ src: '/icon.svg', sizes: '192x192 512x512', type: 'image/svg+xml', purpose: 'any' }],
      },
      devOptions: { enabled: true, type: 'module' },
    }),
  ],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  server: { hmr: process.env.DISABLE_HMR !== 'true', watch: process.env.DISABLE_HMR === 'true' ? null : {} },
}));
