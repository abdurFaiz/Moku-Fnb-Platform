import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock environment variables for Node.js tests
vi.stubEnv('VITE_API_URL', 'http://localhost:8000/api');
vi.stubEnv('VITE_APP_URL', 'http://localhost:5174');
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000/api');
vi.stubEnv('VITE_REVERB_APP_KEY', 'test-key');
vi.stubEnv('VITE_REVERB_HOST', '127.0.0.1');
vi.stubEnv('VITE_REVERB_PORT', '8080');
vi.stubEnv('VITE_REVERB_SCHEME', 'http');

// Mock window.location for tests
Object.defineProperty(window, 'location', {
    value: {
        href: 'http://localhost:5174',
        hostname: 'localhost',
        origin: 'http://localhost:5174',
    },
    writable: true,
});