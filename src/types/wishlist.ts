export interface WishlistItem {
  id: string;
  title: string;
  url: string;
  image?: string;
  description: string;
  dateAdded: string;
  category?: string;
  price?: string;
}

export type WishlistCategory = 'all' | 'lifestyle' | 'tech' | 'home' | 'fashion' | 'other';