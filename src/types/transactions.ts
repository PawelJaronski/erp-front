export interface SimpleExpenseInput {
  id?: string;
  date: string; // ISO yyyy-mm-dd
  category_group: string;
  category: string;
  description: string;
  amount: string; // Polish comma decimal
}

export type SimpleExpenseErrorMap = Record<keyof SimpleExpenseInput, string | undefined>; 