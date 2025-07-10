export function normalizeAmount(raw: string): string {
    if (!raw) return "";
    // First replace the comma with a dot, then remove every dot that is *not*
    // the last one – this guarantees at most one decimal separator.
    return raw.replace(",", ".").replace(/\.(?=.*\.)/g, "");
  }
  
  /** Parse a string amount into a Number (NaN on failure). */
  export function parseAmount(raw: string): number {
    return Number(normalizeAmount(raw));
  }
  
  /** Validate that the provided amount is a positive number greater than zero.
   * Returns an error message string when invalid, otherwise `undefined`. */
  export function validateAmount(raw: string): string | undefined {
    if (!raw.trim()) return "Enter amount";
    const value = parseAmount(raw);
    if (Number.isNaN(value) || value <= 0) return "Enter valid amount greater than 0";
    return undefined;
  } 