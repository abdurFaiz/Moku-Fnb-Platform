import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { TableNumberAPI } from "@/features/table/api/tablenum.api";
import type { TableNumber } from "@/features/table/types/TableNumber";

export const useQueryTableNumbers = (propOutletSlug?: string, existingTables?: TableNumber[]) => {
    const params = useParams<{ outletSlug: string }>();
    const slug = propOutletSlug || params.outletSlug;
    const shouldFetch = Boolean(slug) && (!existingTables || existingTables.length === 0);

    return useQuery({
        queryKey: ['tableNumbers', slug],
        queryFn: () => TableNumberAPI.getListTableNumber(slug as string),
        enabled: shouldFetch,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useQueryTableNumberDetail = (propOutletSlug?: string, existingTables?: TableNumber[]) => {
    const params = useParams<{ outletSlug: string, number_table: string }>();
    const slug = propOutletSlug || params.outletSlug;
    const number_table = params.number_table;
    const hasExistingTable = existingTables?.some(table => table.number === number_table);
    const shouldFetch = Boolean(slug && number_table) && !hasExistingTable;

    return useQuery({
        queryKey: ['tableNumbers', slug, number_table],
        queryFn: () => TableNumberAPI.getDetailTableNumber(slug as string, number_table as string),
        enabled: shouldFetch,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

