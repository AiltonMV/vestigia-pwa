import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { pueblosApiMock } from './mock/pueblosApiMock.ts';
import { usuariosApiMock } from './mock/usuariosApiMock.ts';

const NAVY = '#000F20';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const useMock = env.VITE_API_MOCK === 'true';

  return {
    plugins: [
      react(),
      useMock && pueblosApiMock(),
      useMock && usuariosApiMock(),
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
              // Town catalog: `libre` changes as soon as a game opens or closes a room, so the
              // network wins; the cached copy is only for when there is no answer in 5 s.
              urlPattern: ({ url, request }) =>
                request.method === 'GET' && url.pathname.startsWith('/api/v1/pueblos'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-pueblos',
                networkTimeoutSeconds: 5,
                cacheableResponse: { statuses: [200] },
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
