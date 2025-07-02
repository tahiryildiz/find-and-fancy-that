import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Wishlist } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Share, Eye } from 'lucide-react';
import { CreateWishlistDialog } from '@/components/CreateWishlistDialog';
import { EditWishlistDialog } from '@/components/EditWishlistDialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingWishlist, setEditingWishlist] = useState<Wishlist | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchWishlists();
    }
  }, [user]);

  const fetchWishlists = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlists(data || []);
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: 'İstek listeleri yüklenirken bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWishlist = (newWishlist: Wishlist) => {
    setWishlists([newWishlist, ...wishlists]);
    setCreateDialogOpen(false);
  };

  const handleUpdateWishlist = (updatedWishlist: Wishlist) => {
    setWishlists(wishlists.map(w => w.id === updatedWishlist.id ? updatedWishlist : w));
    setEditingWishlist(null);
  };

  const copyShareLink = (slug: string) => {
    const url = `${window.location.origin}/w/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Kopyalandı!',
      description: 'Paylaşım linki panoya kopyalandı.',
    });
  };

  const viewWishlist = (slug: string) => {
    navigate(`/w/${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-light text-foreground">İstek Listelerim</h1>
            <p className="text-brand-text mt-1">
              Merhaba {user?.user_metadata?.display_name || user?.email}! 
              {wishlists.length} {wishlists.length === 1 ? 'listeniz' : 'listeniz'} var.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Yeni Liste Oluştur
            </Button>
            <Button variant="outline" onClick={signOut}>
              Çıkış Yap
            </Button>
          </div>
        </div>

        {/* Wishlists Grid */}
        {wishlists.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-brand-subtle flex items-center justify-center">
              <Plus className="w-8 h-8 text-brand-text" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              İlk İstek Listenizi Oluşturun
            </h3>
            <p className="text-brand-text max-w-md mx-auto mb-6">
              Favori ürünlerinizi organize edin ve sevdiklerinizle paylaşın.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              İstek Listesi Oluştur
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlists.map((wishlist) => (
              <Card key={wishlist.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-medium">{wishlist.title}</CardTitle>
                      <CardDescription className="text-sm text-brand-text">
                        {new Date(wishlist.created_at).toLocaleDateString('tr-TR')}
                      </CardDescription>
                    </div>
                    {wishlist.logo_url && (
                      <img 
                        src={wishlist.logo_url} 
                        alt="Logo" 
                        className="w-10 h-10 object-contain rounded"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge 
                      variant="secondary" 
                      style={{ backgroundColor: wishlist.background_color }}
                      className="text-xs"
                    >
                      {wishlist.language.toUpperCase()}
                    </Badge>
                    <Badge variant={wishlist.is_public ? "default" : "outline"} className="text-xs">
                      {wishlist.is_public ? 'Herkese Açık' : 'Özel'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => viewWishlist(wishlist.slug)}
                      className="flex-1 gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Görüntüle
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingWishlist(wishlist)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyShareLink(wishlist.slug)}
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateWishlistDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onWishlistCreated={handleCreateWishlist}
      />

      {editingWishlist && (
        <EditWishlistDialog
          wishlist={editingWishlist}
          open={!!editingWishlist}
          onOpenChange={(open) => !open && setEditingWishlist(null)}
          onWishlistUpdated={handleUpdateWishlist}
        />
      )}
    </div>
  );
}