import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Get the full URL for a product image
 * @param imagePath - The image path from the backend (e.g., "products/z4X1jkBQMcARU8uVbmrCtIYuQ8WAnQoF0ZqzXIjq.jpg")
 * @returns Full URL for the image or fallback URL if no image path provided
 */
export function getImageUrl(imagePath?: string | null): string {
    // If no image path provided, return fallback
    if (!imagePath) {
        return "/images/empty-product.svg"; // Local fallback image
    }

    // If image already has full URL, return it
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

    // Remove leading slash if present
    const cleanPath = imagePath.replace(/^\/+/, '');

    const normalizedPath = cleanPath.startsWith('storage/')
        ? cleanPath
        : `storage/${cleanPath}`;

    return `${apiBase}/${normalizedPath}`;
}

export function resolveOutletLogoUrl(url?: string | null): string {
    if (!url) return '';

    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch (error) {
        return url;
    }

    const isLocalHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';

    if (parsed.hostname === 'localhost') {
        parsed.hostname = '127.0.0.1';
    }

    if (import.meta.env.DEV && isLocalHost) {
        const pathWithQuery = `${parsed.pathname}${parsed.search}${parsed.hash}`;
        return `/dev-assets${pathWithQuery}`;
    }

    return parsed.toString();
}

/**
 * Convert an image URL to base64 data URL for use in PDF generation
 * This is necessary because @react-pdf/renderer needs accessible URLs or base64 data
 * @param imageUrl - The image URL to convert
 * @returns Promise that resolves to base64 data URL or empty string on error
 */
export async function imageUrlToBase64(imageUrl: string): Promise<string> {
    if (!imageUrl) return '';

    try {
        // Fetch the image
        const response = await fetch(imageUrl);
        if (!response.ok) {
            console.error('Failed to fetch image:', response.statusText);
            return '';
        }

        // Convert to blob
        const blob = await response.blob();

        // Convert blob to base64
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result as string;
                resolve(base64data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error converting image to base64:', error);
        return '';
    }
}
