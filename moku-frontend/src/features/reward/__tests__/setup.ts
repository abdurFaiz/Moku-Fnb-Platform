import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock global objects that might not be available in test environment
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock IntersectionObserver
globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
})) as any;

// Mock ResizeObserver
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
})) as any;

// Mock window.devicePixelRatio
Object.defineProperty(window, 'devicePixelRatio', {
    writable: true,
    value: 2,
});

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

// Mock @lottiefiles/dotlottie-react
vi.mock('@lottiefiles/dotlottie-react', () => ({
    DotLottieReact: vi.fn(() => null),
}));

// Suppress console warnings during tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.warn = vi.fn();
console.error = vi.fn();

// Restore console methods after tests if needed
export const restoreConsole = () => {
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
};
