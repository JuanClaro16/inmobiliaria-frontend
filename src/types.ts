export type Query = {
  page?: number;
  city?: string;
  mode?: 'rent' | 'sale';
  min_price?: number;
  max_price?: number;
  rooms?: string;
  features?: string;
};

export type PropertyImage = {
  id: number;
  property_id: number;
  path: string | null;
  url?: string | null;
  alt: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Property = {
  id: number;
  city: string;
  rooms: number;
  bathrooms: number;
  consignation_type: 'rent' | 'sale';
  rent_price: number | null;
  sale_price: number | null;
  has_pool: boolean;
  has_elevator: boolean;
  parking_type: 'dos' | 'comunal' | '' | null;
  images?: PropertyImage[];
  created_at?: string;
  updated_at?: string;
};

export type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};
