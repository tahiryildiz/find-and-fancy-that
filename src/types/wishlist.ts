export interface Wishlist {
  id: string;
  title: string;
  description?: string;
  slug: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  background_color?: string;
  font_family?: string;
  language?: string;
  logo_url?: string;
}

export interface WishlistItem {
  id: string;
  wishlist_id: string;
  title: string;
  description?: string;
  url?: string;
  image_url?: string;
  price?: string;
  brand?: string;
  category_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  wishlist_id: string;
}

export interface ItemFormType {
  id: string;
  title: string;
  description: string;
  url: string;
  image_url: string;
  price: string;
  brand: string;
  category_id: string;
}

export interface CategoryFormType {
  id: string;
  name: string;
  color: string;
}

export interface SortOption {
  label: string;
  value: string;
}