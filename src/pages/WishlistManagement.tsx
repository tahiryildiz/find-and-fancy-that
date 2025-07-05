import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Wishlist, Category, Item } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  ArrowLeft, 
  Heart, 
  ThumbsUp, 
  ExternalLink, 
  Edit, 
  Trash2, 
  ArrowDownAZ, 
  Calendar, 
  SortAsc, 
  SortDesc,
  Share2,
  Mail,
  Link,
  Pencil,
  Tags,
  Upload,
  X,
  LinkIcon
} from 'lucide-react';
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
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const { toast } = useToast();

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: ''
  });
  
  // Selected category for edit/delete
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  
  // Add item form state
  const [itemForm, setItemForm] = useState({
    title: '',
    description: '',
    url: '',
    image_url: '',
    price: '',
    category_id: 'none'
  });

  const filteredItems = useMemo(() => {
    // First filter by search query
    let filtered = items.filter(item => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        categories.find(c => c.id === item.category_id)?.name.toLowerCase().includes(query)
      );
    });
    
    // Then filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category_id === selectedCategory);
    }
    
    // Then sort
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'alphabetical':
          return (a.title || '').localeCompare(b.title || '');
        case 'price-high':
          // Parse price strings to numbers, handle missing prices
          const priceA = a.price ? parseFloat(a.price.replace(/[^\d.]/g, '')) : 0;
          const priceB = b.price ? parseFloat(b.price.replace(/[^\d.]/g, '')) : 0;
          return priceB - priceA;
        case 'price-low':
          const pA = a.price ? parseFloat(a.price.replace(/[^\d.]/g, '')) : 0;
          const pB = b.price ? parseFloat(b.price.replace(/[^\d.]/g, '')) : 0;
          return pA - pB;
        default:
          return 0;
      }
    });
  }, [items, categories, searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    if (slug && user) {
      fetchWishlistData();
    }
  }, [slug, user]);
  
  // No additional filtering required - using useMemo instead

  useEffect(() => {
    if (itemForm.category_id === 'new_category') {
      // Open the category management modal instead of using prompt
      setAddItemOpen(false); // Hide the add item modal first
      
      setTimeout(() => {
        // Then show the category management modal
        setManageCategoriesOpen(true);
        // Reset to no category for now
        setItemForm({...itemForm, category_id: 'none'});
      }, 100);
    }
  }, [itemForm.category_id]);

  // Fetch wishlist data from Supabase
  const fetchWishlistData = async () => {
    setLoading(true);
    try {
      // Fetch the wishlist
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (wishlistError) throw wishlistError;
      if (!wishlistData) {
        setLoading(false);
        return;
      }
      
      setWishlist(wishlistData);
      
      // Fetch items for this wishlist
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('wishlist_id', wishlistData.id)
        .order('created_at', { ascending: false });
      
      if (itemsError) throw itemsError;
      setItems(itemsData as Item[] || []);
      
      // Fetch categories using wishlist ID directly
      try {
        console.log('Fetching categories with wishlist ID:', wishlistData.id);
        
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('wishlist_id', wishlistData.id)
          .order('name');
        
        if (categoriesError) throw categoriesError;
        console.log('Fetched categories:', categoriesData);
        setCategories(categoriesData || []);
      } catch (categoryError) {
        console.error('Error fetching categories:', categoryError);
      }
    } catch (error) {
      console.error('Error fetching wishlist data:', error);
      toast({
        title: "Error",
        description: "Failed to load wishlist data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch categories (centralized for reuse)
  const fetchCategories = async () => {
    try {
      console.log('Fetching categories for wishlist ID:', wishlist?.id);
      
      if (!wishlist?.id) {
        console.error('Cannot fetch categories: wishlist ID is undefined');
        return;
      }
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('wishlist_id', wishlist.id)
        .order('name');
      
      if (error) throw error;
      console.log('Fetched categories:', data);
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    }
  };

  // Handle file selection for image upload
  const handleImageFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type and size
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, GIF, WEBP)",
        variant: "destructive"
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Image size should be less than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Start with a local preview regardless of upload success
      const reader = new FileReader();
      reader.onload = (e) => {
        setItemForm(prev => ({
          ...prev,
          image_url: e.target && e.target.result ? e.target.result.toString() : ''
        }));
      };
      reader.readAsDataURL(file);
      
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const filePath = `wishlist_${wishlist?.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(uploadData.path);
        
      // Update form with uploaded image URL
      setItemForm(prev => ({
        ...prev,
        image_url: urlData.publicUrl
      }));
      
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Image upload failed, but preview is available",
        variant: "destructive"
      });
    }
  };

  // Handle saving a category (add or update)
  const handleCategorySave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryForm.name.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a name for the category",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({ name: categoryForm.name.trim() })
          .eq('id', categoryForm.id);
        
        if (error) throw error;
        
        toast({
          title: "Category updated",
          description: `Category "${categoryForm.name}" has been updated`
        });
      } else {
        // Create new category
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: categoryForm.name.trim(),
            wishlist_id: wishlist?.id,
            // Generate a slug from the name
            slug: categoryForm.name.trim().toLowerCase().replace(/\s+/g, '-')
          })
          .select();
        
        if (error) throw error;
        
        toast({
          title: "Category added",
          description: `Category "${categoryForm.name}" has been added`
        });
      }
      
      // Reset form but don't close modal, so user can add multiple categories
      setCategoryForm({ id: '', name: '' });
      setEditingCategory(null);
      
      // Refresh categories list
      await fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive"
      });
    }
  };
  
  // Handle editing a category
  const handleEditCategory = (category: Category) => {
    setCategoryForm({
      id: category.id,
      name: category.name
    });
    setEditingCategory(category.id);
  };
  
  // Handle deleting a category
  const handleDeleteCategory = async (categoryId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this category? Items in this category will not be deleted, but will no longer have a category assigned.');
    
    if (!confirmed) return;
    
    try {
      // First, update all items that use this category to have no category
      const { error: updateError } = await supabase
        .from('items')
        .update({ category_id: null })
        .eq('category_id', categoryId);
      
      if (updateError) throw updateError;
      
      // Then delete the category
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      
      if (deleteError) throw deleteError;
      
      toast({
        title: "Category deleted",
        description: "Category and its associations have been removed"
      });
      
      // Reset form if we were editing the deleted category
      if (editingCategory === categoryId) {
        setCategoryForm({ id: '', name: '' });
        setEditingCategory(null);
      }
      
      // Refresh categories list
      await fetchCategories();
      
      // Also refresh items to update their display
      fetchWishlistData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    }
  };
  
  // Handle adding an item to the wishlist
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemForm.title) {
      toast({
        title: "Missing information",
        description: "Please provide at least a title for your item",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Save the item to the database
      const { data, error } = await supabase
        .from('items')
        .insert([
          { 
            ...itemForm,
            price: itemForm.price || null,
            wishlist_id: wishlist.id,
            category_id: itemForm.category_id === 'none' ? null : itemForm.category_id
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the items list
      setItems(prev => [data, ...prev]);
      
      // Reset form and close modal
      setItemForm({
        title: '',
        description: '',
        url: '',
        image_url: '',
        price: '',
        category_id: 'none'
      });
      setAddItemOpen(false);
      
      toast({
        title: "Item added",
        description: "Your item has been added to the wishlist"
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 max-w-6xl">
      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Loading...</p>
        </div>
      ) : !wishlist ? (
        <div className="text-center py-16">
          <h2 className="text-lg mb-4">Wishlist not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      ) : (
        <main>
          <div className="flex justify-between items-center mb-6">
            <div>
              <Button variant="outline" size="sm" className="mb-2" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold">{wishlist.title}</h1>
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    const shareUrl = `${window.location.origin}/wishlist/${wishlist?.slug}`;
                    navigator.clipboard.writeText(shareUrl);
                    toast({
                      title: "Link copied",
                      description: "Wishlist link copied to clipboard"
                    });
                  }}>
                    <Link className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const shareUrl = `${window.location.origin}/wishlist/${wishlist?.slug}`;
                    if (navigator.share) {
                      navigator.share({
                        title: wishlist?.title || 'My Wishlist',
                        url: shareUrl,
                      }).catch(err => console.error('Error sharing:', err));
                    } else {
                      navigator.clipboard.writeText(shareUrl);
                      toast({
                        title: "Link copied",
                        description: "Wishlist link copied to clipboard"
                      });
                    }
                  }}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Wishlist
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => setAddItemOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
              <Button variant="outline" onClick={() => {
                // Directly fetch categories from Supabase when opening the modal
                if (wishlist?.id) {
                  supabase
                    .from('categories')
                    .select('*')
                    .eq('wishlist_id', wishlist.id)
                    .order('name')
                    .then(({ data, error }) => {
                      if (error) {
                        console.error('Error fetching categories:', error);
                        toast({
                          title: "Error",
                          description: "Failed to load categories",
                          variant: "destructive"
                        });
                      } else {
                        console.log('Successfully fetched categories:', data);
                        setCategories(data || []);
                      }
                    });
                }
                setManageCategoriesOpen(true);
              }}>
                <Tags className="h-4 w-4 mr-2" />
                Manage Categories
              </Button>
            </div>
          </div>
          
          {/* Add Item Dialog */}
          <Dialog 
            open={addItemOpen} 
            onOpenChange={(open) => {
              if (!open) {
                // Only close the dialog when explicitly requested
                setAddItemOpen(false);
                // When we close, reset the form
                setItemForm({
                  title: '',
                  description: '',
                  url: '',
                  image_url: '',
                  price: '',
                  category_id: 'none'
                });
              }
            }}
          >
            <DialogContent 
              className="sm:max-w-md" 
              onInteractOutside={(e) => {
                // Prevent closing when clicking outside
                e.preventDefault();
              }}
            >
              <DialogHeader>
                <DialogTitle>Add to Wishlist</DialogTitle>
                <DialogDescription>
                  Add a new item to your wishlist with details.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={itemForm.title}
                      onChange={(e) => setItemForm({...itemForm, title: e.target.value})}
                      placeholder="e.g., iPhone 15 Pro"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      value={itemForm.description}
                      onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                      placeholder="Add any details about the item"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="url">URL (optional)</Label>
                    <Input
                      id="url"
                      type="url"
                      value={itemForm.url}
                      onChange={(e) => setItemForm({...itemForm, url: e.target.value})}
                      placeholder="https://example.com/product"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (optional)</Label>
                    <Input
                      id="price"
                      value={itemForm.price}
                      onChange={(e) => setItemForm({...itemForm, price: e.target.value})}
                      placeholder="e.g., $1299"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="category">Category</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Close the add item modal first
                          setAddItemOpen(false);
                          // Then open the category management modal
                          setTimeout(() => setManageCategoriesOpen(true), 100);
                        }}
                        className="h-8 text-xs flex items-center gap-1"
                      >
                        <Pencil className="h-3 w-3" /> Manage
                      </Button>
                    </div>
                    <Select
                      value={itemForm.category_id}
                      onValueChange={(value) => setItemForm({...itemForm, category_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Category</SelectItem>
                        <SelectItem value="new_category">+ Add New Category</SelectItem>
                        <SelectSeparator />
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="image">Image (optional)</Label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 relative">
                      {itemForm.image_url ? (
                        <div className="relative w-full">
                          <img 
                            src={itemForm.image_url} 
                            alt="Preview" 
                            className="mx-auto max-h-[200px] rounded-md object-contain" 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-0 right-0 h-8 w-8 p-0"
                            onClick={() => setItemForm({...itemForm, image_url: ''})}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500 mb-2">Click or drag to upload</p>
                          <input
                            id="image"
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleImageFileSelect}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAddItemOpen(false)}>Cancel</Button>
                  <Button type="submit">Add to Wishlist</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          {/* Manage Categories Dialog */}
          <Dialog 
            open={manageCategoriesOpen} 
            onOpenChange={(open) => {
              if (!open) {
                // Only close the dialog when explicitly requested
                setManageCategoriesOpen(false);
                // When we close, reset the form
                setCategoryForm({ id: '', name: '' });
                setEditingCategory(null);
                // Refresh categories to ensure the add item modal has the latest
                fetchCategories();
              }
            }}
          >
            <DialogContent 
              className="sm:max-w-md" 
              onInteractOutside={(e) => {
                // Prevent closing when clicking outside
                e.preventDefault();
              }}
            >
              <DialogHeader>
                <DialogTitle>Manage Categories</DialogTitle>
                <DialogDescription>
                  Add, edit, or remove categories to organize your wishlist items.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCategorySave} className="space-y-4">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category_name">
                      {editingCategory ? 'Edit Category' : 'New Category'}
                    </Label>
                    <Input
                      id="category_name"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                      placeholder="e.g., Electronics, Books, Clothing"
                    />
                  </div>
                          
                  <div className="flex justify-end space-x-2">
                    {editingCategory ? (
                      <>
                        <Button 
                          type="button" 
                          variant="ghost"
                          onClick={() => {
                            setCategoryForm({ id: '', name: '' });
                            setEditingCategory(null);
                          }}
                        >
                          Cancel Edit
                        </Button>
                        <Button type="submit">
                          Update
                        </Button>
                      </>
                    ) : (
                      <Button type="submit">
                        Add Category
                      </Button>
                    )}
                  </div>
                </div>
                          
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Existing Categories</h4>
                  {categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No categories yet. Add your first category above.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex justify-between items-center border rounded-md p-2">
                          <span>{category.name}</span>
                          <div className="flex space-x-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                      
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setManageCategoriesOpen(false)}>
                    Done
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Items Display */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Input 
                  placeholder="Search items..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  >
                    ×
                  </button>
                )}
              </div>
              
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <SortDesc className="h-4 w-4" />
                      Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1).replace('-', ' ')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortBy('newest')} className="gap-2">
                      <Calendar className="h-4 w-4" /> Newest
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('oldest')} className="gap-2">
                      <Calendar className="h-4 w-4" /> Oldest
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('alphabetical')} className="gap-2">
                      <ArrowDownAZ className="h-4 w-4" /> A-Z
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('price-high')} className="gap-2">
                      <SortDesc className="h-4 w-4" /> Price: High to Low
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('price-low')} className="gap-2">
                      <SortAsc className="h-4 w-4" /> Price: Low to High
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No items found in your wishlist</p>
                <Button onClick={() => setAddItemOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Item
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <a 
                    key={item.id} 
                    href={item.url || '#'} 
                    target={item.url ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="block h-full"
                    onClick={(e) => {
                      if (!item.url) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Card className="overflow-hidden flex flex-col h-full transition-all hover:shadow-lg cursor-pointer">
                      {item.image_url && (
                        <div className="aspect-[4/3] overflow-hidden bg-muted">
                          <img 
                            src={item.image_url} 
                            alt={item.title}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      )}
                      <CardContent className="flex-grow p-4">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h3 className="font-medium">{item.title}</h3>
                          <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                            {/* Action buttons for each item */}
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                            {item.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          {item.category_id && categories.find(c => c.id === item.category_id) && (
                            <Badge variant="secondary" className="text-xs">
                              <Tags className="h-3 w-3 mr-1" />
                              {categories.find(c => c.id === item.category_id)?.name}
                            </Badge>
                          )}
                          
                          {item.price && (
                            <Badge variant="outline" className="text-xs">
                              {item.price}
                            </Badge>
                          )}
                        </div>
                        
                        {item.url && (
                          <div className="flex justify-start items-center mt-2">
                            <div className="text-xs text-blue-600">
                              <ExternalLink className="h-3 w-3" />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
