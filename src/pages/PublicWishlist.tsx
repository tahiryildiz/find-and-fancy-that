import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Wishlist, Category, Item, Language } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ThumbsUp, Copy, Share, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { t } from '@/utils/i18n';

export default function PublicWishlist() {
  const { slug } = useParams<{ slug: string }>();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchWishlistData();
    }
  }, [slug]);

  const fetchWishlistData = async () => {
    try {
      // Fetch wishlist
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select('*')
        .eq('slug', slug)
        .eq('is_public', true)
        .single();

      if (wishlistError) throw new Error('İstek listesi bulunamadı');
      
      setWishlist(wishlistData);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('wishlist_id', wishlistData.id)
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch items
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('wishlist_id', wishlistData.id)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;
      setItems(itemsData || []);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInteraction = async (itemId: string, type: 'heart' | 'thumbs_up') => {
    try {
      const { error } = await supabase
        .from('item_interactions')
        .upsert(
          {
            item_id: itemId,
            interaction_type: type,
            ip_address: null, // Will be handled by RLS
            user_agent: navigator.userAgent,
          },
          { 
            onConflict: 'item_id,interaction_type,ip_address',
            ignoreDuplicates: true 
          }
        );

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      // Refresh items to get updated counts
      const { data: updatedItems, error: fetchError } = await supabase
        .from('items')
        .select('*')
        .eq('wishlist_id', wishlist?.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setItems(updatedItems || []);

      toast({
        title: type === 'heart' ? '❤️' : '👍',
        description: 'Teşekkürler!',
      });
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: 'Bir hata oluştu, lütfen tekrar deneyin.',
        variant: 'destructive',
      });
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: t('copied', wishlist?.language as Language || 'tr'),
      description: 'Link panoya kopyalandı.',
    });
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: wishlist?.title,
          url: window.location.href,
        });
      } catch (error) {
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  const filteredItems = items.filter(item => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'other') return !item.category_id;
    return item.category_id === selectedCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fff2eb' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !wishlist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            İstek Listesi Bulunamadı
          </h1>
          <p className="text-muted-foreground">
            Aradığınız istek listesi mevcut değil veya herkese açık değil.
          </p>
        </div>
      </div>
    );
  }

  const lang = wishlist.language as Language;

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: wishlist.background_color,
        fontFamily: wishlist.font_family 
      }}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          {wishlist.logo_url && (
            <img 
              src={wishlist.logo_url} 
              alt="Logo" 
              className="w-16 h-16 object-contain mb-4"
            />
          )}
          <h1 className="text-3xl font-light text-foreground mb-2">
            {wishlist.title}
          </h1>
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
              <Copy className="w-4 h-4" />
              {t('copy', lang)}
            </Button>
            <Button variant="outline" size="sm" onClick={shareNative} className="gap-2">
              <Share className="w-4 h-4" />
              {t('share', lang)}
            </Button>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <nav className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-foreground text-background'
                  : 'bg-background/50 text-foreground hover:bg-background/70'
              }`}
            >
              {t('all', lang) || 'Tümü'}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-foreground text-background'
                    : 'bg-background/50 text-foreground hover:bg-background/70'
                }`}
              >
                {category.name}
              </button>
            ))}
          </nav>
        )}

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-foreground/70">
              {t('noItems', lang)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className="group hover:shadow-lg transition-shadow overflow-hidden"
                style={{ backgroundColor: wishlist.background_color }}
              >
                {item.image_url && (
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-medium text-foreground line-clamp-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-foreground/70 line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {item.price && (
                    <Badge variant="secondary" className="text-xs">
                      {item.price}
                    </Badge>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleInteraction(item.id, 'heart')}
                        className="flex items-center gap-1 text-sm text-foreground/70 hover:text-red-500 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        {item.heart_count}
                      </button>
                      <button
                        onClick={() => handleInteraction(item.id, 'thumbs_up')}
                        className="flex items-center gap-1 text-sm text-foreground/70 hover:text-blue-500 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        {item.thumbs_up_count}
                      </button>
                    </div>
                    
                    {item.url && (
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                        className="h-8 w-8 p-0"
                      >
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}