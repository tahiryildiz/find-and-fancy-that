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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for wishlist data
  const [loading, setLoading] = useState<boolean>(true);
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // State for filtering and sorting
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // State for item form
  const [addItemOpen, setAddItemOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [itemForm, setItemForm] = useState<{
    id: string;
    title: string;
    description: string;
    url: string;
    image_url: string;
    price: string;
    brand: string;
    category_id: string | null;
  }>({
    id: '',
    title: '',
    description: '',
    url: '',
    image_url: '',
    price: '',
    brand: '',
    category_id: 'none'
  });

  // State for category management
  const [categoryModalOpen, setCategoryModalOpen] = useState<boolean>(false);
  const [categoryForm, setCategoryForm] = useState<{ id: string; name: string }>({ id: '', name: '' });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    if (slug && user) {
      fetchWishlistData();
    }
  }, [slug, user]);

  // Function to reset item form to default values
  const resetItemForm = () => {
    setItemForm({
      id: '',
      title: '',
      description: '',
      url: '',
      image_url: '',
      price: '',
      brand: '',
      category_id: 'none'
    });
    setIsEditing(false);
  };

  // Function continues in part 2...
}
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
      setItems(itemsData || []);
      
      // Fetch categories for this wishlist
      try {
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
        description: "File size should be less than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    // Display preview immediately before upload completes
    const reader = new FileReader();
    reader.onload = (e) => {
      setItemForm(prev => ({
        ...prev,
        image_url: e.target && e.target.result ? e.target.result.toString() : ''
      }));
    };
    reader.readAsDataURL(file);
    
    // Upload to Supabase Storage
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${wishlist!.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error } = await supabase.storage
        .from('images')
        .upload(fileName, file);
        
      if (error) throw error;
      
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

  // Handle saving an item (add or update)
  const handleSaveItem = async (e: React.FormEvent) => {
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
      if (isEditing) {
        // Update existing item
        const { error } = await supabase
          .from('items')
          .update({
            title: itemForm.title,
            description: itemForm.description,
            url: itemForm.url,
            image_url: itemForm.image_url,
            price: itemForm.price,
            brand: itemForm.brand,
            category_id: itemForm.category_id === 'none' ? null : itemForm.category_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', itemForm.id);
        
        if (error) throw error;
        
        // Update the items list
        setItems(prevItems => 
          prevItems.map(item => 
            item.id === itemForm.id ? {...item, ...itemForm} : item
          )
        );
        
        toast({
          title: "Item updated",
          description: "Item has been updated successfully"
        });
      } else {
        // Add new item
        const { data, error } = await supabase
          .from('items')
          .insert([{
            wishlist_id: wishlist!.id,
            title: itemForm.title,
            description: itemForm.description,
            url: itemForm.url,
            image_url: itemForm.image_url,
            price: itemForm.price,
            brand: itemForm.brand,
            category_id: itemForm.category_id === 'none' ? null : itemForm.category_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
        
        if (error) throw error;
        
        // Update the items list
        setItems(prevItems => [...prevItems, data]);
        
        toast({
          title: "Item added",
          description: "New item added to your wishlist"
        });
      }
      
      // Clear the form and reset editing state
      resetItemForm();
      
      // Close the dialog
      setAddItemOpen(false);
      
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} item`,
        variant: "destructive"
      });
    }
  };

  // Handle deleting an item
  const handleDeleteItem = async (itemId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this item?');
    
    if (!confirmed) return;
    
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);
        
      if (error) throw error;
      
      // Remove from UI
      setItems(prev => prev.filter(i => i.id !== itemId));
      
      toast({
        title: "Item deleted",
        description: "Item has been removed from your wishlist"
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
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
        // Add new category
        const { error } = await supabase
          .from('categories')
          .insert([{
            wishlist_id: wishlist!.id,
            name: categoryForm.name.trim()
          }])
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
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
      
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

  // Share wishlist via email
  const handleShareViaEmail = () => {
    if (!wishlist) return;
    
    const subject = encodeURIComponent(`Check out my wishlist: ${wishlist.title}`);
    const body = encodeURIComponent(`Here's my wishlist "${wishlist.title}":\n\n${window.location.origin}/wishlist/${wishlist.slug}\n\nEnjoy!`);
    
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    
    toast({
      title: "Share initiated",
      description: "Your email client should open with the wishlist link"
    });
  };

  // Copy wishlist link to clipboard
  const handleCopyLink = () => {
    if (!wishlist) return;
    
    const link = `${window.location.origin}/wishlist/${wishlist.slug}`;
    navigator.clipboard.writeText(link);
    
    toast({
      title: "Link copied",
      description: "Wishlist link copied to clipboard"
    });
  };
  // Filter items by category and search term
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category filter
      const categoryMatches = categoryFilter === null || item.category_id === categoryFilter;
      
      // Search term filter
      const searchTermLower = searchTerm.toLowerCase();
      const searchMatches = searchTerm === '' || 
        item.title?.toLowerCase().includes(searchTermLower) ||
        item.description?.toLowerCase().includes(searchTermLower) ||
        item.brand?.toLowerCase().includes(searchTermLower);
      
      return categoryMatches && searchMatches;
    }).sort((a, b) => {
      // Sort by selected field
      if (sortBy === 'title') {
        return sortOrder === 'asc'
          ? (a.title || '').localeCompare(b.title || '')
          : (b.title || '').localeCompare(a.title || '');
      } else if (sortBy === 'date') {
        const dateA = new Date(a.updated_at || a.created_at).getTime();
        const dateB = new Date(b.updated_at || b.created_at).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
  }, [items, categoryFilter, searchTerm, sortBy, sortOrder]);

  // Get categories that have items
  const activeCategories = useMemo(() => {
    const categoryIds = new Set(items.map(item => item.category_id).filter(Boolean));
    return categories.filter(category => categoryIds.has(category.id));
  }, [categories, items]);

  // Render the component
  return (
    <div className="container py-8">
      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Loading...</p>
        </div>
      ) : (
        <main>
          {/* Back button and header */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h1 className="text-3xl font-bold">{wishlist?.title}</h1>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Link className="mr-2 h-4 w-4" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareViaEmail}>
                    <Mail className="mr-2 h-4 w-4" />
                    Share via Email
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Category filters */}
            {activeCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <Button
                  size="sm"
                  variant={categoryFilter === null ? "default" : "outline"}
                  onClick={() => setCategoryFilter(null)}
                >
                  All
                </Button>
                
                {activeCategories.map(category => (
                  <Button
                    key={category.id}
                    size="sm"
                    variant={categoryFilter === category.id ? "default" : "outline"}
                    onClick={() => setCategoryFilter(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCategoryModalOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Search and sort controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSortOrder(order => (order === 'asc' ? 'desc' : 'asc'))}
                >
                  {sortOrder === 'asc' ? <SortAsc /> : <SortDesc />}
                </Button>
                
                <Button onClick={() => {
                  resetItemForm();
                  setAddItemOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No items found.</p>
                <Button 
                  onClick={() => {
                    resetItemForm();
                    setAddItemOpen(true);
                  }}
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first item
                </Button>
              </div>
            ) : (
              <>
                {filteredItems.map((item) => (
                  <div key={item.id} className="col-span-1">
                    <Card 
                      className="h-full cursor-pointer hover:shadow-md transition-all" 
                      onClick={() => {
                        if (item.url) {
                          window.open(item.url, '_blank');
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{item.title}</h3>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setItemForm({
                                  id: item.id,
                                  title: item.title,
                                  description: item.description,
                                  url: item.url,
                                  image_url: item.image_url,
                                  price: item.price,
                                  brand: item.brand,
                                  category_id: item.category_id || 'none'
                                });
                                setIsEditing(true);
                                setAddItemOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteItem(item.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                            {item.description}
                          </p>
                        )}
                        
                        {item.image_url && (
                          <div className="relative mb-2 aspect-video">
                            <img 
                              src={item.image_url} 
                              alt={item.title} 
                              className="rounded-md object-cover h-full w-full"
                            />
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          {item.category_id && categories.find(c => c.id === item.category_id) && (
                            <Badge variant="secondary" className="text-xs">
                              <Tags className="h-3 w-3 mr-1" />
                              {categories.find(c => c.id === item.category_id)?.name}
                            </Badge>
                          )}
                          
                          {item.brand && (
                            <Badge variant="outline" className="text-xs bg-blue-50">
                              {item.brand}
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
                            <div className="flex items-center text-xs text-blue-600">
                              <ExternalLink className="h-3 w-3 mr-1" /> Visit
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </>
            )}
          </div>
          
          {/* Add/Edit Item Dialog */}
          <Dialog 
            open={addItemOpen} 
            onOpenChange={(open) => {
              if (!open) {
                // Reset form when dialog is closed
                resetItemForm();
              }
              setAddItemOpen(open);
            }}
            onInteractOutside={(e) => {
              // Prevent closing when clicking outside
              e.preventDefault();
            }}
          >
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{isEditing ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                <DialogDescription>
                  {isEditing ? 'Update item details' : 'Add a new item to your wishlist'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSaveItem} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    value={itemForm.title}
                    onChange={(e) => setItemForm({...itemForm, title: e.target.value})}
                    placeholder="Item name"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea 
                    id="description" 
                    value={itemForm.description}
                    onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                    placeholder="Describe the item"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="url">URL (optional)</Label>
                    <Input 
                      id="url" 
                      type="url"
                      value={itemForm.url}
                      onChange={(e) => setItemForm({...itemForm, url: e.target.value})}
                      placeholder="https://"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (optional)</Label>
                    <Input 
                      id="price" 
                      value={itemForm.price}
                      onChange={(e) => setItemForm({...itemForm, price: e.target.value})}
                      placeholder="$99.99"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="brand">Brand (optional)</Label>
                  <Input 
                    id="brand" 
                    value={itemForm.brand}
                    onChange={(e) => setItemForm({...itemForm, brand: e.target.value})}
                    placeholder="Brand name"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category">Category (optional)</Label>
                  <Select 
                    value={itemForm.category_id || 'none'} 
                    onValueChange={(value) => setItemForm({...itemForm, category_id: value === 'none' ? null : value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
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
                
                <DialogFooter>
                  <Button type="submit">
                    {isEditing ? 'Update Item' : 'Add Item'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          {/* Category Management Dialog */}
          <Dialog
            open={categoryModalOpen}
            onOpenChange={setCategoryModalOpen}
            onInteractOutside={(e) => {
              // Prevent closing when clicking outside
              e.preventDefault();
            }}
          >
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Manage Categories</DialogTitle>
                <DialogDescription>
                  Add, edit, or delete categories for your wishlist items
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <form onSubmit={handleCategorySave} className="flex gap-2">
                  <Input 
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    placeholder="New category name"
                    className="flex-1"
                  />
                  <Button type="submit">
                    {editingCategory ? 'Update' : 'Add'}
                  </Button>
                  {editingCategory && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setCategoryForm({ id: '', name: '' });
                        setEditingCategory(null);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </form>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {categories.map((category) => (
                    <div 
                      key={category.id}
                      className="flex justify-between items-center border rounded-md p-2"
                    >
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
                  
                  {categories.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No categories yet</p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      )}
    </div>
  );
}
