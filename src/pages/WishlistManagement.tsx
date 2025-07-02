import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Wishlist, Category, Item } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, ArrowLeft, Heart, ThumbsUp, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function WishlistManagement() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  // Add item form state
  const [itemForm, setItemForm] = useState({
    title: '',
    description: '',
    url: '',
    image_url: '',
    price: '',
    category_id: ''
  });

  useEffect(() => {
    if (slug && user) {
      fetchWishlistData();
    }
  }, [slug, user]);

  const fetchWishlistData = async () => {
    try {
      // Fetch wishlist (ensure user owns it)
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select('*')
        .eq('slug', slug)
        .eq('user_id', user?.id)
        .single();

      if (wishlistError) {
        toast({
          title: 'Error',
          description: 'Wishlist not found or access denied.',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }
      
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
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemForm.title.trim() || !itemForm.description.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in title and description.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('items')
        .insert([
          {
            wishlist_id: wishlist?.id,
            title: itemForm.title.trim(),
            description: itemForm.description.trim(),
            url: itemForm.url.trim() || null,
            image_url: itemForm.image_url.trim() || null,
            price: itemForm.price.trim() || null,
            category_id: itemForm.category_id || null,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setItems([data, ...items]);
      setItemForm({
        title: '',
        description: '',
        url: '',
        image_url: '',
        price: '',
        category_id: ''
      });
      setAddItemOpen(false);

      toast({
        title: 'Success',
        description: 'Item added to wishlist!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredItems = items.filter(item => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'uncategorized') return !item.category_id;
    return item.category_id === selectedCategory;
  });

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

  if (!wishlist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Wishlist Not Found</h1>
          <p className="text-muted-foreground mb-4">The wishlist you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-brand-subtle/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{wishlist.title}</h1>
                <p className="text-brand-text text-sm">{items.length} items in this wishlist</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setAddItemOpen(true)} 
                className="gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/w/${wishlist.slug}`)}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Public Page
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Items ({items.length})
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name} ({items.filter(item => item.category_id === category.id).length})
              </Button>
            ))}
            <Button
              variant={selectedCategory === 'uncategorized' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('uncategorized')}
            >
              Uncategorized ({items.filter(item => !item.category_id).length})
            </Button>
          </div>
        )}

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shadow-lg">
              <Plus className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {selectedCategory === 'all' ? 'Add Your First Item' : 'No Items in This Category'}
            </h3>
            <p className="text-brand-text max-w-md mx-auto mb-8 leading-relaxed">
              {selectedCategory === 'all' 
                ? 'Start building your wishlist by adding products you want to buy or receive as gifts.'
                : 'There are no items in this category yet. Try adding some items or check other categories.'
              }
            </p>
            <Button onClick={() => setAddItemOpen(true)} size="lg" className="gap-2 shadow-lg">
              <Plus className="w-5 h-5" />
              Add Your First Item
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
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
                    <h3 className="font-semibold text-foreground line-clamp-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-brand-text line-clamp-2 mt-1">
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
                      <span className="flex items-center gap-1 text-sm text-brand-text">
                        <Heart className="w-4 h-4" />
                        {item.heart_count || 0}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-brand-text">
                        <ThumbsUp className="w-4 h-4" />
                        {item.thumbs_up_count || 0}
                      </span>
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
      </main>

      {/* Add Item Dialog */}
      <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Add a product or item that you want to your wishlist.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={itemForm.title}
                onChange={(e) => setItemForm({...itemForm, title: e.target.value})}
                placeholder="Product name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={itemForm.description}
                onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                placeholder="Why do you want this item? What makes it special?"
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="url">Product URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={itemForm.url}
                  onChange={(e) => setItemForm({...itemForm, url: e.target.value})}
                  placeholder="https://example.com/product"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({...itemForm, price: e.target.value})}
                  placeholder="$99"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={itemForm.image_url}
                  onChange={(e) => setItemForm({...itemForm, image_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={itemForm.category_id} onValueChange={(value) => setItemForm({...itemForm, category_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddItemOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add to Wishlist</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}