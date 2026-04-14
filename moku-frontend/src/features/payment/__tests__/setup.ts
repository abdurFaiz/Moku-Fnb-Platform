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

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock document.createElement for anchor elements (used in download functionality)
const originalCreateElement = document.createElement.bind(document);
document.createElement = vi.fn().mockImplementation((tagName: string) => {
    if (tagName === 'a') {
        const element = originalCreateElement(tagName);
        element.click = vi.fn();
        element.remove = vi.fn();
        return element;
    }
    return originalCreateElement(tagName);
});

// Mock File constructor
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

// Mock URL.createObjectURL and revokeObjectURL
Object.defineProperty(URL, 'createObjectURL', {
    writable: true,
    value: vi.fn(() => 'blob:mock-url'),
});

Object.defineProperty(URL, 'revokeObjectURL', {
    writable: true,
    value: vi.fn(),
});

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
