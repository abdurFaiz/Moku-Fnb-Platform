import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'

const env = loadEnv(process.env.MODE ?? 'test', process.cwd(), '')

export default defineConfig({
  plugins: [react()],
  test: {
    setupFiles: ['./test-setup-browser.ts'],
    env: {
      VITE_API_URL: env.VITE_API_URL ?? 'http://localhost:8000/api',
      VITE_APP_URL: env.VITE_APP_URL ?? 'http://localhost:5174',
      VITE_API_BASE_URL: env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
      VITE_AXIOS_BASE_URL: env.VITE_AXIOS_BASE_URL ?? 'http://localhost:8000/api', // matches axios.ts expectation
    },
    browser: {
      enabled: true,
      provider: playwright(),
      api: {
        port: 5176,
      },
      // https://vitest.dev/config/browser/playwright,
      instances: [
        { browser: 'chromium' },
        { browser: 'firefox' },
        { browser: 'webkit' },
      ],
    },
  },
})
