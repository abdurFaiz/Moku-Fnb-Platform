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

// Mock FormData as a proper constructor
class MockFormData {
    private data: Map<string, any> = new Map();

    append(key: string, value: any) {
        this.data.set(key, value);
    }

    delete(key: string) {
        this.data.delete(key);
    }

    get(key: string) {
        return this.data.get(key);
    }

    getAll(key: string) {
        return [this.data.get(key)];
    }

    has(key: string) {
        return this.data.has(key);
    }

    set(key: string, value: any) {
        this.data.set(key, value);
    }

    entries() {
        return this.data.entries();
    }

    keys() {
        return this.data.keys();
    }

    values() {
        return this.data.values();
    }

    forEach(callback: (value: any, key: string) => void) {
        this.data.forEach(callback);
    }
}

globalThis.FormData = MockFormData as any;

// Mock File constructor as a proper class
class MockFile extends Blob {
    name: string;
    lastModified: number;

    constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
        super(bits, options);
        this.name = name;
        this.lastModified = options?.lastModified || Date.now();
    }
}

globalThis.File = MockFile as any;

// Mock location with proper href setter
const mockLocation = {
    href: 'http://localhost:5174/',
    origin: 'http://localhost:5174',
    pathname: '/',
    search: '',
    hash: '',
};

Object.defineProperty(globalThis, 'location', {
    writable: true,
    value: mockLocation,
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
