export type MaybeStatus = number | string | undefined | null;

/**
 * Returns true if the given status should block new checkouts.
 * Currently blocking statuses: backend id 2 (waiting for confirmation) or
 * frontend label 'menunggu-konfirmasi' (and string '2').
 */
export function isBlockingStatus(status: MaybeStatus): boolean {
    if (status === undefined || status === null) return false;

    // numeric 2 (backend) - check if it rounds to 2 for floating point precision
    if (typeof status === 'number') {
        return Math.round(status) === 2;
    }

    // string handling
    if (typeof status === 'string') {
        // Trim whitespace first
        const trimmed = status.trim();

        if (trimmed === 'menunggu-konfirmasi') return true;

        // Only parse if no whitespace in original (to reject '  2  ')
        if (status === trimmed) {
            const parsed = Number(status);
            if (!Number.isNaN(parsed) && Math.round(parsed) === 2) return true;
        }
    }

    return false;
}

export function isOrderBlocking(order: any): boolean {
    return isBlockingStatus(order?.status);
}

export default isOrderBlocking;
