import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_API_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const rpcParams: Record<string, unknown> = {
    p_account: params.get('account'),
    p_category_group: params.get('category_group'),
    p_category: params.get('category'),
    p_date_from: params.get('date_from'),
    p_date_to: params.get('date_to'),
    p_date_preset: params.get('date_preset'),
    p_amount_type: params.get('amount_type'),
    p_search: params.get('search'),
  };
  // Remove undefined/null/empty
  Object.keys(rpcParams).forEach((k) => {
    if (!rpcParams[k]) delete rpcParams[k];
  });

  const { data, error } = await supabase.rpc('sum_transactions_for_filters', rpcParams);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
} 