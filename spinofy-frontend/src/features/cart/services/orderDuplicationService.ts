/**
 * Legacy duplication service retained temporarily for backward compatibility.
 * Prefer using `useMutationDuplicateOrder` from `@/hooks/api/mutation/useMutationDuplicateOrder`.
 */
export class OrderDuplicationService {
    static async duplicateOrder(): Promise<never> {
        throw new Error('OrderDuplicationService is deprecated. Use useMutationDuplicateOrder hook instead.');
    }
}

export default OrderDuplicationService;
