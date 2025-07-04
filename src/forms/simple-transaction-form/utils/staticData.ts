// Categories mapped to their group
export const categoriesData = [
  // cogs_printing
  { value: "calendar", group: "cogs_printing" },
  { value: "mug_330", group: "cogs_printing" },
  { value: "mug_590", group: "cogs_printing" },
  { value: "shipping_reflect", group: "cogs_printing" },
  { value: "tshirt_black", group: "cogs_printing" },
  { value: "tshirt_white", group: "cogs_printing" },

  // cogs
  { value: "prowizje_bramki", group: "cogs" },

  // opex
  { value: "ads", group: "opex" },
  { value: "biuro", group: "opex" },
  { value: "car_cost", group: "opex" },
  { value: "car_leasing", group: "opex" },
  { value: "credit_line_cost", group: "opex" },
  { value: "credit_line_payment", group: "opex" },
  { value: "equipment", group: "opex" },
  { value: "leasing", group: "opex" },
  { value: "loan_cost", group: "opex" },
  { value: "loan_payment", group: "opex" },
  { value: "other_opex", group: "opex" },
  { value: "owner_payment", group: "opex" },
  { value: "reconciliation", group: "opex" },
  { value: "services", group: "opex" },
  { value: "shipping", group: "opex" },
  { value: "software", group: "opex" },
  { value: "trade_fair", group: "opex" },
  { value: "transport", group: "opex" },

  // taxes
  { value: "vat", group: "taxes" },
  { value: "zus", group: "taxes" },
] as const;

export type CategoryGroupValue = typeof categoriesData[number]["group"];
export type CategoryValue = typeof categoriesData[number]["value"];

// List of available bank / cash accounts
export const accounts = [
  { value: "mbank_firmowe", label: "mbank_firmowe" },
  { value: "mbank_osobiste", label: "mbank_osobiste" },
  { value: "cash", label: "cash" },
  { value: "sumup", label: "sumup" },
] as const;

// High-level category groups for expenses (plus "other")
export const categoryGroups = [
  { value: "cogs_printing", label: "cogs_printing" },
  { value: "cogs", label: "cogs" },
  { value: "opex", label: "opex" },
  { value: "taxes", label: "taxes" },
  { value: "other", label: "other" },
] as const; 