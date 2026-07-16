export interface Product {
  id: string;
  title: string;
  category: string;
  prices: Record<string, string>; // e.g. { "S": "650 (20)", "M": "850 (30)" }
  sizes: string[]; // e.g. ["S", "M", "L", "XL"]
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string; // Lucide icon identifier
  emoji?: string; // Emoji representation for kiosk view
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
  price: number; // Stored numeric unit price
  label: string; // Stored serving label (e.g. "20")
  partyBoxDishes?: string[]; // Selected 4 dishes for Party Box
}
