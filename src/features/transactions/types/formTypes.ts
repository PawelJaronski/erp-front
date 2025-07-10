interface BaseFormData {
    business_timestamp: string;
    business_reference?: string;
    item?: string;
    note?: string;
  }
  
  export interface SimpleExpenseFormData extends BaseFormData {
    account: string;
    category_group: string;
    category: string;
    custom_category_group?: string;
    custom_category?: string;
    gross_amount: string;
    include_tax: boolean;
    tax_rate: number;
  }
  
  export interface SimpleIncomeFormData extends BaseFormData {
    account: string;
    category_group: string;
    category: string;
    custom_category_group?: string;
    custom_category?: string;
    gross_amount: string;
    include_tax: boolean;
    tax_rate: number;
  }
  
  export interface SimpleTransferFormData extends BaseFormData {
    account: string;
    to_account: string;
    gross_amount: string;
  }
  
  export interface PaymentBrokerTransferFormData extends BaseFormData {
    paynow_transfer?: string;
    autopay_transfer?: string;
    transfer_date?: string;
    sales_date?: string;
  }