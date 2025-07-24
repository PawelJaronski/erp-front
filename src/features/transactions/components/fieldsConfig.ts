export const simpleExpenseFields = [
  { name: "account", type: "account", label: "Account", required: true },
  { name: "categoryGroup", type: "categoryGroup" },
  { name: "category", type: "category"},
  { name: "gross_amount", type: "amount", label: "Amount", required: true },
  { name: "item", type: "item", label: "Item" },
  { name: "note", type: "note", label: "Note" },
  { name: "business_reference", type: "text", label: "Business Reference" },
  { name: "include_tax", type: "vat"},
  { name: "business_timestamp", type: "date", label: "Business Date", required: true },
]; 