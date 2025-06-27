export interface TransactionInput {
  id?: string;
  date: string; // ISO yyyy-mm-dd
  category_group: string;
  category: string;
  description: string;
  amount: string; // Polish comma decimal
}

export type TransactionErrorMap = Record<keyof TransactionInput, string | undefined>; 