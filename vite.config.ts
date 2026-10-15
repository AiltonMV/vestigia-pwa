import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { salasApiMock } from './mock/salasApiMock.ts';

const NAVY = '#000F20';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const useMock = env.VITE_API_MOCK === 'true';

  return {
    plugins: [
      react(),
      useMock && salasApiMock(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['fonts/*.woff2', 'icons/apple-touch-icon.png'],
        manifest: {
          name: 'Vestigia',
          short_name: 'Vestigia',
          description: 'Una aventura breve de misterio para PC y teléfono.',
          lang: 'es',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          background_color: NAVY,
          theme_color: NAVY,
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: '/icons/icon-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // App shell precached; any route falls back to it so /salas opens offline.
          globPatterns: ['**/*.{js,css,html,woff2,png,svg}'],
          navigateFallbackDenylist: [/^\/api\//],
          // The 3D landing bundle is large; raise the limit so it is precached too.
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          runtimeCaching: [
            {
              // Room list: show the last copy right away (also offline) and refresh it behind.
              urlPattern: ({ url, request }) =>
                request.method === 'GET' && url.pathname.startsWith('/api/salas'),
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'api-salas',
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
      port: 5173,
      proxy: useMock ? undefined : { '/api': 'http://localhost:8080' },
    },
  };
});
