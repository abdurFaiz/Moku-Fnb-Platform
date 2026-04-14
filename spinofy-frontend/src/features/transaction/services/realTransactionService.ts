
import { OrderAPI } from '@/features/transaction/api/order.api';
import { OutletAPI } from '@/features/outlets/api/outlet.api';
import { OrderTransactionMapper } from './orderTransactionMapper';
import type {
    Transaction,
    TransactionQuery,
    ApiResponse,
} from '@/features/transaction/types/Transaction';
import type { Outlet } from '@/features/outlets/types/Outlet';

/**
 * Real Transaction API Service that uses Order API
 * Replaces mock data with actual API calls
 */
export class RealTransactionApiService {
    private static readonly cache = new Map<string, { data: unknown; timestamp: number }>();
    private static readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
    private static readonly OUTLET_CACHE_DURATION_MS = 10 * 60 * 1000; // cache outlet lookups for 10 minutes
    private static outletListCache: { outlets: Outlet[]; expiresAt: number } | null = null;

    /**
     * Get outlet slug from parameter or fallback to first available outlet
     * @param preferredSlug - Optional preferred outlet slug
     */
    private static async getOutletSlug(preferredSlug?: string): Promise<string> {
        const outlets = await this.getOutletList();

        if (!outlets.length) {
            throw new Error('No outlets available');
        }

        if (preferredSlug) {
            const foundOutlet = outlets.find((outlet) => outlet.slug === preferredSlug);
            if (foundOutlet) {
                return preferredSlug;
            }
        }

        return outlets[0].slug;
    }

    /**
     * Get outlet name by slug
     */
    private static async getOutletName(outletSlug: string): Promise<string> {
        const outlets = await this.getOutletList();
        const matchedOutlet = outlets.find((outlet) => outlet.slug === outletSlug);

        if (matchedOutlet?.name) {
            return matchedOutlet.name;
        }

        // Fallback: attempt direct fetch once more if it wasn't in the cached list
        try {
            const outletResponse = await OutletAPI.getOutlet(outletSlug);
            const outletName = outletResponse.data?.outlet?.name;
            if (outletName) {
                return outletName;
            }
        } catch (error) {
            // Ignore and fall through to default label
        }

        return '-';
    }

    private static async getOutletList(): Promise<Outlet[]> {
        const now = Date.now();

        if (this.outletListCache && this.outletListCache.expiresAt > now) {
            return this.outletListCache.outlets;
        }

        try {
            const outletsResponse = await OutletAPI.getListOutlets();
            const outlets = outletsResponse.data?.outlets ?? [];

            this.outletListCache = {
                outlets,
                expiresAt: now + this.OUTLET_CACHE_DURATION_MS,
            };

            return outlets;
        } catch (error) {
            this.outletListCache = null;
            throw new Error('Failed to get outlet information');
        }
    }

    private static getCacheKey(key: string, params?: string | object): string {
        return params ? `${key}_${JSON.stringify(params)}` : key;
    }

    private static isCacheValid(key: string): boolean {
        const cached = this.cache.get(key);
        if (!cached) return false;

        const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION_MS;
        return !isExpired;
    }

    private static setCache<T>(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }

    private static getCache<T>(key: string): T | null {
        const cached = this.cache.get(key);
        return cached ? cached.data as T : null;
    }

    /**
     * Get all transactions from Order API (completed orders only)
     * @param outletSlug - Optional outlet slug, falls back to first outlet if not provided
     */
    static async getAllTransactions(outletSlug?: string): Promise<ApiResponse<Transaction[]>> {
        try {
            const resolvedOutletSlug = await this.getOutletSlug(outletSlug);
            const cacheKey = this.getCacheKey("all_transactions", resolvedOutletSlug);

            if (this.isCacheValid(cacheKey)) {
                const cachedData = this.getCache<Transaction[]>(cacheKey);
                if (cachedData) {
                    return { data: cachedData, success: true };
                }
            }

            // Get outlet slug and name
            const outletName = await this.getOutletName(resolvedOutletSlug);

            // Fetch orders from Order API (for completed/historical orders)
            // Use OrderAPI instead of PaymentAPI for transaction history
            const orderResponse = await OrderAPI.getListOrders(resolvedOutletSlug);

            // Handle both response formats: data.orders[] and data.order[]
            // The API returns 'orders' (plural) but type definition says 'order' (singular)
            const orders = (orderResponse.data as any)?.orders || orderResponse.data?.order;

            if (!orders || !Array.isArray(orders) || orders.length === 0) {
                return {
                    data: [],
                    success: true,
                    message: "No orders found",
                };
            }

            // Map orders array to transactions
            const transactions = OrderTransactionMapper.mapOrdersToTransactions(
                orders,
                outletName
            );

            this.setCache(cacheKey, transactions);

            return {
                data: transactions,
                success: true,
                message: "Transactions fetched successfully",
            };
        } catch (error) {
            console.error("Error fetching transactions:", error);
            return {
                data: [],
                success: false,
                message: error instanceof Error ? error.message : "Failed to fetch transactions",
            };
        }
    }

    /**
     * Get transaction by ID using OrderAPI.getOrderDetails
     * @param id - Transaction ID (order code)
     * @param outletSlug - Optional outlet slug
     */
    static async getTransactionById(id: string, outletSlug?: string): Promise<ApiResponse<Transaction | null>> {
        try {

            const numId = Number.parseInt(id, 10);
            if (Number.isNaN(numId) || numId <= 0) {
                throw new Error(`Invalid transaction ID: ${id}`);
            }

            const resolvedOutletSlug = await this.getOutletSlug(outletSlug);
            const cacheKey = this.getCacheKey("transaction_by_id", { id, outletSlug: resolvedOutletSlug });

            if (this.isCacheValid(cacheKey)) {
                const cachedData = this.getCache<Transaction | null>(cacheKey);
                if (cachedData !== undefined) {

                    return { data: cachedData, success: true };
                }
            }

            // Get outlet name (slug already resolved)
            const outletName = await this.getOutletName(resolvedOutletSlug);


            // Fetch order details directly from API
            const orderResponse = await OrderAPI.getOrderDetails(resolvedOutletSlug, numId);


            // Handle both array and object response formats
            let order = null;
            const orderData = orderResponse.data?.order;


            if (Array.isArray(orderData) && orderData.length > 0) {

                order = orderData[0];
            } else if (orderData && typeof orderData === 'object' && !Array.isArray(orderData)) {

                order = orderData;
            } else {
                // Try to access directly from orderResponse.data if it's the order itself

                const data = orderResponse.data as any;
                if (data && data.code && data.id) {

                    order = data;
                }
            }

            if (!order) {

                return {
                    data: null,
                    success: false,
                    message: "Order not found",
                };
            }


            // Map single order to transaction
            const transaction = OrderTransactionMapper.mapOrderToTransaction(order, outletName);

            this.setCache(cacheKey, transaction);

            return {
                data: transaction,
                success: true,
                message: "Transaction found",
            };
        } catch (error) {

            return {
                data: null,
                success: false,
                message: error instanceof Error ? error.message : "Failed to fetch transaction",
            };
        }
    }

    /**
     * Get filtered transactions
     * @param query - Transaction query parameters
     * @param outletSlug - Optional outlet slug
     */
    static async getTransactions(query: TransactionQuery = {}, outletSlug?: string): Promise<ApiResponse<Transaction[]>> {
        try {
            const { status, limit, offset = 0 } = query;
            const resolvedOutletSlug = await this.getOutletSlug(outletSlug);
            const cacheKey = this.getCacheKey("filtered_transactions", { ...query, outletSlug: resolvedOutletSlug });

            if (this.isCacheValid(cacheKey)) {
                const cachedData = this.getCache<Transaction[]>(cacheKey);
                if (cachedData) {
                    return { data: cachedData, success: true };
                }
            }

            const allTransactionsResponse = await this.getAllTransactions(resolvedOutletSlug);
            if (!allTransactionsResponse.success) {
                return allTransactionsResponse;
            }

            let filteredTransactions = allTransactionsResponse.data;

            // Apply status filter
            if (status && status !== "semua") {
                filteredTransactions = filteredTransactions.filter(
                    (t) => t.status === status,
                );
            }

            // Apply pagination
            if (limit) {
                filteredTransactions = filteredTransactions.slice(
                    offset,
                    offset + limit,
                );
            }

            this.setCache(cacheKey, filteredTransactions);

            return {
                data: filteredTransactions,
                success: true,
                message: `Found ${filteredTransactions.length} transactions`,
            };
        } catch (error) {
            console.error("Error fetching filtered transactions:", error);
            return {
                data: [],
                success: false,
                message: error instanceof Error ? error.message : "Failed to fetch transactions",
            };
        }
    }

    /**
     * Clear all cache
     */
    static clearCache(): void {
        this.cache.clear();
    }

    /**
     * Clear cache by pattern
     */
    static clearCacheByPattern(pattern: string): void {
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }
}