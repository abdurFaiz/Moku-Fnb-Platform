import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { playwright } from '@vitest/browser-playwright'
import { defineConfig, loadEnv } from "vite"
import { sentryVitePlugin } from "@sentry/vite-plugin";
import packageJson from './package.json';
import Sitemap from 'vite-plugin-sitemap';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  const outletSlugs = [
    'spinocafe',
    'demo-outlet',
  ];

  const dynamicRoutes = outletSlugs.flatMap(slug => [
    `/${slug}/home`,
    `/${slug}/search-product`,
    `/${slug}/recommend`,
    `/${slug}/faq`,
    `/${slug}/privacy-policy`,
    `/${slug}/terms-and-conditions`,
    `/${slug}/refund-policy`,
  ]);

  // 4. Add static routes (like your landing page)
  const allRoutes = [
    '/outlet-selection',
    ...dynamicRoutes
  ];
  return {
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version),
    },
    plugins: [
      react(),
      tailwindcss(),
      Sitemap({
        hostname: 'https://my.spinofy.id',
        dynamicRoutes: allRoutes,
        outDir: 'dist',
        robots: [{
          userAgent: '*',
          allow: '/',
          disallow: [
            '/auth/',
            '/webhook/',
          ]
        }]
      }),
      VitePWA({
        strategies: "injectManifest",
        srcDir: "src",
        filename: "sw.ts",
        registerType: "prompt",
        injectRegister: false,

        pwaAssets: {
          disabled: false,
          config: true,
        },

        manifest: {
          name: "spinoselforder",
          short_name: "spinocafe",
          description: "self order by spinotek",
          theme_color: "#f35f0f",
          start_url: "/",
          display: "standalone",
          background_color: "#ffffff",
          orientation: "portrait",
        },

        injectManifest: {
          globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        },

        workbox: {
          clientsClaim: true,
          skipWaiting: true,

          runtimeCaching: [
            {
              urlPattern:
                /^https?:\/\/.*\/api\/(home|vouchers|transaksi|akun).*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-data-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60, // 1 Jam
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "images-assets-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Hari
                },
              },
            },
            {
              urlPattern: /\/assets\/.*\.(js|css)$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "static-assets-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 31536000
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /\/index\.html$/,
              handler: "NetworkFirst",
              options: {
                cacheName: "html-cache",
                expiration: {
                  maxEntries: 5,
                  maxAgeSeconds: 3600
                }
              }
            }

          ],
        },

        devOptions: {
          enabled: true,
          navigateFallback: "index.html",
          suppressWarnings: true,
          type: "module",
        },
      }),
      sentryVitePlugin({
        org: "spinofy",
        project: "javascript-react",
        authToken: env.SENTRY_AUTH_TOKEN,
        release: {
          name: `spinofy-frontend@${packageJson.version}`,
        },
        // telemetry: true,
        // disable: false
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 5174,
      hmr: {
        host: "localhost",
      },
      proxy: {
        '/dev-assets': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/dev-assets/, ''),
        },
      },
    },
    build: {
      target: "esnext",
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
      sourcemap: false,
    },
    test: {
      browser: {
        provider: playwright(),
        enabled: true,
        instances: [
          { browser: 'chromium' },
        ],
      },
    },
  };
});