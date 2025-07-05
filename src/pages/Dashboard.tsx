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
  const [wishlists, setWishlists] = useState<(Wishlist & { item_count?: number })[]>([]);
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
      // First fetch wishlists
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (wishlistError) throw wishlistError;

      // Then fetch item counts for each wishlist
      const wishlistsWithCounts = await Promise.all(
        (wishlistData || []).map(async (wishlist) => {
          const { count } = await supabase
            .from('items')
            .select('*', { count: 'exact', head: true })
            .eq('wishlist_id', wishlist.id);
          
          return { ...wishlist, item_count: count || 0 };
        })
      );

      setWishlists(wishlistsWithCounts);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load wishlists.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWishlist = (newWishlist: Wishlist) => {
    const wishlistWithCount = { ...newWishlist, item_count: 0 };
    setWishlists([wishlistWithCount, ...wishlists]);
    setCreateDialogOpen(false);
  };

  const handleUpdateWishlist = (updatedWishlist: Wishlist) => {
    setWishlists(wishlists.map(w => 
      w.id === updatedWishlist.id 
        ? { ...updatedWishlist, item_count: w.item_count } 
        : w
    ));
    setEditingWishlist(null);
  };

  const copyShareLink = (slug: string) => {
    const url = `${window.location.origin}/w/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Copied!',
      description: 'Share link copied to clipboard.',
    });
  };

  const viewWishlist = (slug: string) => {
    const wishlist = wishlists.find(w => w.slug === slug);
    if (wishlist && wishlist.item_count === 0) {
      navigate(`/manage/${slug}`);
    } else {
      navigate(`/w/${slug}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-brand-subtle/20">
      {/* Header with proper spacing */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-primary-foreground">W</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">My Wishlists</h1>
                <p className="text-brand-text mt-1 text-sm">
                  Welcome back, {user?.user_metadata?.display_name || user?.email?.split('@')[0]}! 
                  {wishlists.reduce((total, w) => total + (w.item_count || 0), 0)} items across {wishlists.length} {wishlists.length === 1 ? 'wishlist' : 'wishlists'}.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setCreateDialogOpen(true)} className="gap-2 shadow-lg hover:shadow-xl transition-all">
                <Plus className="w-4 h-4" />
                Create New List
              </Button>
              <Button variant="outline" onClick={signOut} className="shadow-sm hover:shadow-md transition-all">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content with proper margins */}
      <main className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Wishlists Grid */}
        {wishlists.length === 0 ? (
          <div className="text-center py-20 max-w-lg mx-auto">
            <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shadow-lg">
              <Plus className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Create Your First Wishlist
            </h3>
            <p className="text-brand-text mb-8 leading-relaxed text-lg">
              Organize your favorite products, track what you want to buy next, and share with friends and family.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all px-8">
              <Plus className="w-5 h-5" />
              Create Wishlist
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlists.map((wishlist) => (
              <Card key={wishlist.id} className="group hover:shadow-xl transition-all duration-300 border border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-4 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl font-semibold text-foreground mb-2 truncate">{wishlist.title}</CardTitle>
                      <CardDescription className="text-sm text-brand-text">
                        Created {new Date(wishlist.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </CardDescription>
                    </div>
                    {wishlist.logo_url && (
                      <img 
                        src={wishlist.logo_url} 
                        alt="Logo" 
                        className="w-12 h-12 object-contain rounded-lg shadow-sm ml-4 flex-shrink-0"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Badge 
                      variant="secondary" 
                      className="text-xs font-medium bg-primary/10 text-primary border-primary/20 px-3 py-1"
                    >
                      {wishlist.item_count || 0} items
                    </Badge>
                    <Badge variant={wishlist.is_public ? "default" : "outline"} className="text-xs px-3 py-1">
                      {wishlist.is_public ? 'Public' : 'Private'}
                    </Badge>
                    <div 
                      className="w-4 h-4 rounded-full border border-border/30 flex-shrink-0"
                      style={{ backgroundColor: wishlist.background_color }}
                      title={`Background: ${wishlist.background_color}`}
                    />
                  </div>
                  
                  {wishlist.item_count === 0 && (
                    <div className="mb-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
                      <p className="text-xs text-accent font-medium mb-1">Ready to add items!</p>
                      <p className="text-xs text-muted-foreground">Click "Manage" to start adding products to your wishlist.</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/w/${wishlist.slug}`)}
                      className="flex-1 gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/manage/${wishlist.slug}`)}
                      className="flex-1 gap-2 hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-all"
                    >
                      <Settings className="w-4 h-4" />
                      Manage
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingWishlist(wishlist)}
                      className="hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-all"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyShareLink(wishlist.slug)}
                      className="hover:bg-secondary/10 hover:text-secondary hover:border-secondary/30 transition-all"
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

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