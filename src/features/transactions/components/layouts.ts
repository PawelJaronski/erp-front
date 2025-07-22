export const simpleExpenseLayout2Col = [
  [{ name: "account", colSpan: 1, colStart: 1 }],
  [{ name: "categoryGroup", colSpan: 1, colStart: 1 }, { name: "category" }],
  [{ name: "gross_amount" }, { name: "item" }],
  [{ name: "note" }, { name: "business_reference" }],
  [{ name: "include_tax" }, { name: "business_timestamp" }],
];

export const simpleExpenseLayout3Col = [
  [{ name: "account", colSpan: 1, colStart: 1 }, { name: "categoryGroup", colSpan: 1 }, { name: "category", colSpan: 1 }],
  [{ name: "gross_amount", colSpan: 1 }, { name: "business_timestamp", colSpan: 1 }, { name: "item", colSpan: 1 }],
  [{ name: "include_tax", colSpan: 1 }, { name: "note", colSpan: 1 }, ],
  [{ name: "business_reference", colSpan: 1 } ],
]; 