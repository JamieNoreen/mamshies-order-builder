/**
 * Utility to extract numeric price and optional serving label from menu price strings.
 * Example inputs:
 * - "900 (30 pcs)" -> { price: 900, label: "30 pcs" }
 * - "650 (20)" -> { price: 650, label: "20" }
 * - "700" -> { price: 700, label: "" }
 */
export function parsePriceAndLabel(priceStr: string): { price: number; label: string } {
  if (!priceStr) {
    return { price: 0, label: '' };
  }
  
  // Clean string and find content inside parenthesis
  const trimmed = priceStr.trim();
  const match = trimmed.match(/^(\d+)\s*\(([^)]+)\)$/);
  
  if (match) {
    return {
      price: parseFloat(match[1]) || 0,
      label: match[2].trim(),
    };
  }
  
  return {
    price: parseFloat(trimmed) || 0,
    label: '',
  };
}
