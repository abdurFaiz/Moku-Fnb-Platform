import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock global objects that might not be available in test environment
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
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

// Mock document.createElement for anchor elements (used in download functionality)
const originalCreateElement = document.createElement;
document.createElement = vi.fn().mockImplementation((tagName: string) => {
    if (tagName === 'a') {
        return {
            href: '',
            download: '',
            click: vi.fn(),
            remove: vi.fn(),
        };
    }
    return originalCreateElement.call(document, tagName);
});

// Mock File constructor for sharing functionality
globalThis.File = vi.fn().mockImplementation((bits, name, options) => ({
    name,
    size: bits.length,
    type: options?.type || '',
    lastModified: Date.now(),
})) as any;

// Mock Blob constructor
globalThis.Blob = vi.fn().mockImplementation((content, options) => ({
    size: content ? content.length : 0,
    type: options?.type || '',
})) as any;

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