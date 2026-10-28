export interface ProductData {
  id: string | number;
  name: string;
  price: number;
  original_price?: number;
  product_line?: string;
  image_url?: string;
  description?: string;
  category?: string;
  label?: string;
  has_size?: boolean;
  is_open?: boolean;
  sale_end_date?: string;
}

export interface SizeOption {
  size: string;
  stock_physical: number;
  stock_reserved: number;
}

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image_url?: string;
  size: string;
  quantity: number;
  label?: string;
}

