// Database types for the application
import { Database } from '../integrations/supabase/types';

// Language type for i18n
export type Language = 'en' | 'tr' | 'de' | 'fr' | string;

// Type for wishlists
export interface Wishlist {
  id: string;
  title: string;
  slug: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_public: boolean | null;
  background_color: string | null;
  font_family: string | null;
  language: string | null;
  logo_url: string | null;
}

// Type for categories
export interface Category {
  id: string;
  name: string;
  slug: string;
  wishlist_id: string;
  created_at: string;
}

// Type for items
export interface Item {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  image_url: string | null;
  price: string | null;
  brand: string | null; // Added brand field
  category_id: string | null;
  wishlist_id: string;
  created_at: string;
  updated_at: string;
  heart_count?: number | null;
  thumbs_up_count?: number | null;
}

// Type-safe database row access
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];