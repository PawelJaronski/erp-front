export interface SimpleTransactionInput {
  id?: string;
  date: string; // ISO yyyy-mm-dd
  category_group: string;
  category: string;
  description: string;
  amount: string; // Polish comma decimal
}

export type SimpleTransactionErrorMap = Record<keyof SimpleTransactionInput, string | undefined>; 