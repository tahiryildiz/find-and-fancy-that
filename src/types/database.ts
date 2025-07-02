export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  background_color: string;
  logo_url: string | null;
  font_family: string;
  language: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  wishlist_id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Item {
  id: string;
  wishlist_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  url: string | null;
  image_url: string | null;
  price: string | null;
  heart_count: number;
  thumbs_up_count: number;
  created_at: string;
  updated_at: string;
}

export interface ItemInteraction {
  id: string;
  item_id: string;
  interaction_type: 'heart' | 'thumbs_up';
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export type Language = 'tr' | 'en' | 'de' | 'fr' | 'es';

export interface LanguageTexts {
  [key: string]: {
    [K in Language]: string;
  };
}