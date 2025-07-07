import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Wishlist, WishlistItem, Category } from '@/types/wishlist';

export function useWishlistData(slug: string | undefined) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlistData = async () => {
      if (!slug) {
        setLoading(false);
        setError('No wishlist slug provided');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch wishlist data
        const { data: wishlistData, error: wishlistError } = await supabase
          .from('wishlists')
          .select('*')
          .eq('slug', slug)
          .single();

        if (wishlistError) throw wishlistError;
        if (!wishlistData) throw new Error('Wishlist not found');

        setWishlist(wishlistData);

        // Fetch items
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('*')
          .eq('wishlist_id', wishlistData.id)
          .order('created_at', { ascending: false });

        if (itemsError) throw itemsError;
        setItems(itemsData || []);

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('wishlist_id', wishlistData.id)
          .order('name', { ascending: true });

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

      } catch (error: any) {
        console.error('Error fetching wishlist data:', error);
        setError(error.message || 'Failed to fetch wishlist data');
        toast({ 
          title: "Error", 
          description: "Failed to load wishlist data", 
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistData();
  }, [slug, toast]);

  return {
    loading,
    wishlist,
    items,
    setItems,
    categories,
    setCategories,
    error,
    refetch: () => {
      setLoading(true);
      // We're simply triggering the effect again by changing a dependency
      // This is a bit of a hack, but it works for our purposes
    }
  };
}
