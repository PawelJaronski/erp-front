export interface TransactionItem {
    id: string;
    event_type: string;
    category_group: string;
    category: string;
    account: string;
    gross_amount: number | null;
    net_amount: number | null;
    vat_amount: number | null;
    business_timestamp: string;
    business_reference: string | null;
    payload: Record<string, unknown>;
}

export interface TransactionFilters {
    account?: string;
    category_group?: string;
    category?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
    date_preset?: string;
    amount_type?: string;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    limit?: number;
}

export interface TransactionListResponse {
    transactions: TransactionItem[];
    total_count: number;
    page: number;
    limit: number;
    has_next: boolean;
    has_previous: boolean;
}