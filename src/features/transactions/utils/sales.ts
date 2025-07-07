import { createClient } from '@supabase/supabase-js';

let supabaseSingleton: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (supabaseSingleton) return supabaseSingleton;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_API_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase environment variables are missing. Please define NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_API_KEY)."
    );
  }

  supabaseSingleton = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseSingleton;
}

export interface SalesData {
  paynow: number;
  total: number;
}

// Global cache for sales data
const salesCache = new Map<string, SalesData>();

export async function fetchSalesForDate(date: string): Promise<SalesData> {
  if (!date) throw new Error("Date is required");

  // Check cache first
  if (salesCache.has(date)) {
    return salesCache.get(date)!;
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc(
    "sum_shop_sales_on_day_pl_paynow",
    { day: date }
  );

  if (error) throw error;

  const value = typeof data === "number" ? data : 0;

  const result = {
    paynow: value,
    total: value,
  };

  salesCache.set(date, result);
  return result;
} 