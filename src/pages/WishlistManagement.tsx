import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, X, Pencil, Trash2, Share, ExternalLink, Search, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type ItemFormType = {
  id: string;
  title: string;
  description: string;
  url: string;
  image_url: string;
  price: string;
  brand: string;
  category_id: string;
};

type CategoryFormType = {
  id: string;
  name: string;
};

interface Wishlist {
  id: string;
  title: string;
  description?: string;
  slug: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  background_color?: string;
  font_family?: string;
  language?: string;
  logo_url?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  wishlist_id: string;
  created_at: string;
}

interface Item {
  id: string;
  title: string;
  description: string;
  url: string;
  image_url: string;
  price: string;
  brand: string;
  category_id: string;
  wishlist_id: string;
  created_at: string;
}

export default function WishlistManagement() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Main data state
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal state
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // Form state
  const [itemForm, setItemForm] = useState<ItemFormType>({
    id: '',
    title: '',
    description: '',
    url: '',
    image_url: '',
    price: '',
    brand: '',
    category_id: 'none'
  });
  const [categoryForm, setCategoryForm] = useState<CategoryFormType>({
    id: '',
    name: ''
  });

  // Search and sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchWishlistData();
    }
  }, [slug]);

  // Reset functions
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
    setImageFile(null);
    setImagePreview(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      id: '',
      name: ''
    });
    setEditingCategory(null);
  };

  // Main data fetching
  const fetchWishlistData = async () => {
    try {
      setLoading(true);
      
      // Get wishlist
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (wishlistError) throw wishlistError;
      if (!wishlistData) {
        navigate('/not-found');
        return;
      }
      
      setWishlist(wishlistData);
      
      // Get items
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('wishlist_id', wishlistData.id)
        .order('created_at', { ascending: false });
      
      if (itemsError) throw itemsError;
      setItems(itemsData || []);
      
      // Get categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('wishlist_id', wishlistData.id)
        .order('name');
      
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);
      
    } catch (error) {
      toast({ 
        title: "Error loading wishlist", 
        description: "Failed to load wishlist data. Please try again.", 
        variant: "destructive" 
      });
      console.error("Error fetching wishlist data:", error);
    } finally {
      setLoading(false);
    }
  };
  // Item CRUD operations
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${wishlist!.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('item-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('item-images')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

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
      let imageUrl = itemForm.image_url;
      
      // Upload image if there's a new file
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      
      if (isEditing) {
        // When brand is added or changed, update the title to follow 'Brand + Name' format
        const oldItem = items.find(item => item.id === itemForm.id);
        let updatedTitle = itemForm.title;
        
        // Check if brand was added or changed and update title if needed
        if (itemForm.brand && (!oldItem?.brand || oldItem.brand !== itemForm.brand)) {
          // Extract the product name without the brand if it already contains the brand
          const productNameOnly = oldItem?.brand && itemForm.title.startsWith(oldItem.brand) ? 
            itemForm.title.slice(oldItem.brand.length).trim() : 
            itemForm.title;
            
          // Format as 'Brand + Name'
          updatedTitle = `${itemForm.brand} ${productNameOnly}`;
        }
        
        // Update existing item
        const { error } = await supabase
          .from('items')
          .update({
            title: updatedTitle,
            description: itemForm.description,
            url: itemForm.url,
            image_url: imageUrl,
            price: itemForm.price,
            brand: itemForm.brand,
            category_id: itemForm.category_id === 'none' ? null : itemForm.category_id,
          })
          .eq('id', itemForm.id);
        
        if (error) throw error;
        
        // Update local state
        setItems(prevItems => prevItems.map(item => 
          item.id === itemForm.id ? 
            {...item, ...itemForm, title: updatedTitle, image_url: imageUrl, category_id: itemForm.category_id === 'none' ? null : itemForm.category_id} : 
            item
        ));
        
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
            image_url: imageUrl,
            price: itemForm.price,
            brand: itemForm.brand,
            category_id: itemForm.category_id === 'none' ? null : itemForm.category_id,
          }])
          .select()
          .single();
        
        if (error) throw error;
        
        // Update local state
        setItems(prevItems => [data, ...prevItems]);
        
        toast({ 
          title: "Item added", 
          description: "New item added to your wishlist" 
        });
      }
      
      // Reset form and close modal
      resetItemForm();
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

  const handleDeleteItem = async (itemId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this item?');
    if (!confirmed) return;
    
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      
      // Update local state
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

  const handleEditItem = (item: Item) => {
    setItemForm({
      id: item.id,
      title: item.title,
      description: item.description || '',
      url: item.url || '',
      image_url: item.image_url || '',
      price: item.price || '',
      brand: item.brand || '',
      category_id: item.category_id || 'none'
    });
    setIsEditing(true);
    setAddItemOpen(true);
    // Set image preview if there's an image URL
    if (item.image_url) {
      setImagePreview(item.image_url);
    }
  };

  // Category CRUD operations
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast({ 
        title: "Missing information", 
        description: "Please provide a category name", 
        variant: "destructive" 
      });
      return;
    }
    
    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({ 
            name: categoryForm.name.trim() 
          })
          .eq('id', editingCategory);
        
        if (error) throw error;
        
        // Update local state
        setCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.id === editingCategory ? 
              { ...cat, name: categoryForm.name.trim() } : 
              cat
          )
        );
        
        toast({ 
          title: "Category updated", 
          description: "Category has been updated successfully" 
        });
      } else {
        // Add new category
        const { data, error } = await supabase
          .from('categories')
          .insert([{
            wishlist_id: wishlist!.id,
            name: categoryForm.name.trim(),
            slug: categoryForm.name.trim().toLowerCase().replace(/\s+/g, '-')
          }])
          .select()
          .single();
        
        if (error) throw error;
        
        // Update local state
        setCategories(prevCategories => [...prevCategories, data]);
        
        toast({ 
          title: "Category added", 
          description: "New category added to your wishlist" 
        });
      }
      
      // Reset form
      resetCategoryForm();
      
    } catch (error) {
      console.error('Error saving category:', error);
      toast({ 
        title: "Error", 
        description: `Failed to ${editingCategory ? 'update' : 'add'} category`, 
        variant: "destructive" 
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this category? Items in this category will be uncategorized.');
    if (!confirmed) return;
    
    try {
      // First update items to remove category association
      const { error: itemsError } = await supabase
        .from('items')
        .update({ category_id: null })
        .eq('category_id', categoryId);
      
      if (itemsError) throw itemsError;
      
      // Then delete the category
      const { error: categoryError } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      
      if (categoryError) throw categoryError;
      
      // Update local state
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      setItems(prev => prev.map(item => 
        item.category_id === categoryId ? { ...item, category_id: null } : item
      ));
      
      if (editingCategory === categoryId) {
        resetCategoryForm();
      }
      
      toast({ 
        title: "Category deleted", 
        description: "Category has been removed from your wishlist" 
      });
      
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete category", 
        variant: "destructive" 
      });
    }
  };

  const handleEditCategory = (category: Category) => {
    setCategoryForm({
      id: category.id,
      name: category.name
    });
    setEditingCategory(category.id);
  };

  // Share functions
  const handleShareLink = () => {
    if (!wishlist) return;
    
    const shareUrl = `${window.location.origin}/wishlist/${wishlist.slug}`;
    navigator.clipboard.writeText(shareUrl);
    toast({ 
      title: "Link copied", 
      description: "Wishlist link copied to clipboard" 
    });
  };

  const handleShareEmail = () => {
    if (!wishlist) return;
    
    const shareUrl = `${window.location.origin}/wishlist/${wishlist.slug}`;
    const subject = `Check out my wishlist: ${wishlist.title}`;
    const body = `I wanted to share my wishlist "${wishlist.title}" with you. You can view it here: ${shareUrl}`;
    
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };
  // Derived data
  const filteredItems = useMemo(() => {
    let result = [...items];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(item => item.category_id === categoryFilter);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        (item.title && item.title.toLowerCase().includes(term)) || 
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.brand && item.brand.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '') * (sortOrder === 'asc' ? 1 : -1);
      } else if (sortBy === 'price') {
        const priceA = a.price ? parseFloat(a.price) : 0;
        const priceB = b.price ? parseFloat(b.price) : 0;
        return (priceA - priceB) * (sortOrder === 'asc' ? 1 : -1);
      } else { // date
        return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * (sortOrder === 'asc' ? 1 : -1);
      }
    });
    
    return result;
  }, [items, categoryFilter, searchTerm, sortBy, sortOrder]);

  // Category IDs with at least one item
  const categoryIds = useMemo(() => {
    const ids = new Set(items.filter(item => item.category_id).map(item => item.category_id));
    return Array.from(ids);
  }, [items]);

  // Only show categories that have at least one item
  const activeCategories = useMemo(() => {
    return categories.filter(cat => categoryIds.includes(cat.id));
  }, [categories, categoryIds]);

  if (loading) {
    return (
      <div className="container py-10 text-center">
        <p>Loading wishlist...</p>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="container py-10 text-center">
        <p>Wishlist not found</p>
        <Button onClick={() => navigate('/')} className="mt-4">Go Home</Button>
      </div>
    );
  }

  return (
    <div className="container py-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{wishlist.title}</h1>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => {
              resetItemForm();
              setAddItemOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <PlusCircle size={16} /> Add Item
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Share size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShareLink}>
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareEmail}>
                Share by Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Categories */}
        <div className="w-full mt-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge
              key="all"
              variant={categoryFilter === 'all' ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setCategoryFilter('all')}
            >
              All Items
            </Badge>
            {activeCategories.map(cat => (
              <Badge
                key={cat.id}
                variant={categoryFilter === cat.id ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setCategoryFilter(cat.id)}
              >
                {cat.name}
              </Badge>
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setManageCategoriesOpen(true)}
              className="ml-2"
            >
              Manage Categories
            </Button>
          </div>
        </div>
      </div>

      {/* Search and sort */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
          <Input
            placeholder="Search items..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date Added</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="price">Price</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          >
            <ChevronDown className={sortOrder === 'asc' ? 'transform rotate-180' : ''} size={16} />
          </Button>
        </div>
      </div>

      {/* Items grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">
            {searchTerm || categoryFilter !== 'all' ? 
              "No items match your filters" : 
              "No items yet. Add your first item using the button above."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => {
            const category = categories.find(c => c.id === item.category_id);
            return (
              <Card key={item.id} className="overflow-hidden">
                <div 
                  className="relative h-48 bg-gray-100 cursor-pointer" 
                  onClick={() => item.url && window.open(item.url, '_blank')}
                >
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  {item.url && (
                    <div className="absolute top-2 right-2 bg-white p-1 rounded-full shadow">
                      <ExternalLink size={16} />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold line-clamp-2">{item.title}</h3>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditItem(item);
                        }}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">{item.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.price && (
                      <Badge variant="secondary">${item.price}</Badge>
                    )}
                    {item.brand && (
                      <Badge variant="outline">{item.brand}</Badge>
                    )}
                    {category && (
                      <Badge variant="outline" className="bg-gray-100">{category.name}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Item Modal */}
      <Dialog 
        open={addItemOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setAddItemOpen(false);
            resetItemForm();
          }
        }}
      >
        <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveItem}>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">Title *</label>
                <Input 
                  id="title" 
                  value={itemForm.title} 
                  onChange={(e) => setItemForm({...itemForm, title: e.target.value})}
                  placeholder="Item title"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                <Textarea 
                  id="description" 
                  value={itemForm.description} 
                  onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                  placeholder="Item description"
                  rows={3}
                />
              </div>
              <div>
                <label htmlFor="url" className="block text-sm font-medium mb-1">URL</label>
                <Input 
                  id="url" 
                  type="url"
                  value={itemForm.url} 
                  onChange={(e) => setItemForm({...itemForm, url: e.target.value})}
                  placeholder="https://example.com/item"
                />
              </div>
              <div>
                <label htmlFor="image" className="block text-sm font-medium mb-1">Image</label>
                <div className="space-y-2">
                  {imagePreview && (
                    <div className="relative h-40 w-full">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                          setItemForm({...itemForm, image_url: ''});
                        }}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  )}
                  <Input 
                    id="image" 
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500">Or enter image URL directly:</p>
                  <Input
                    value={itemForm.image_url}
                    onChange={(e) => setItemForm({...itemForm, image_url: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="price" className="block text-sm font-medium mb-1">Price</label>
                  <Input 
                    id="price" 
                    value={itemForm.price} 
                    onChange={(e) => setItemForm({...itemForm, price: e.target.value})}
                    placeholder="19.99"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="brand" className="block text-sm font-medium mb-1">Brand</label>
                  <Input 
                    id="brand" 
                    value={itemForm.brand} 
                    onChange={(e) => setItemForm({...itemForm, brand: e.target.value})}
                    placeholder="Brand name"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
                <Select 
                  value={itemForm.category_id} 
                  onValueChange={(value) => setItemForm({...itemForm, category_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={() => {
                resetItemForm();
                setAddItemOpen(false);
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Item' : 'Add Item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manage Categories Modal */}
      <Dialog 
        open={manageCategoriesOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setManageCategoriesOpen(false);
            resetCategoryForm();
          }
        }}
      >
        <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <form onSubmit={handleSaveCategory} className="flex items-end gap-2">
              <div className="flex-1">
                <label htmlFor="categoryName" className="block text-sm font-medium mb-1">
                  {editingCategory ? 'Edit Category' : 'New Category'}
                </label>
                <Input 
                  id="categoryName" 
                  value={categoryForm.name} 
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  placeholder="Category name"
                  required
                />
              </div>
              <Button type="submit">
                {editingCategory ? 'Update' : 'Add'}
              </Button>
            </form>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Existing Categories</h3>
              {categories.length === 0 ? (
                <p className="text-sm text-gray-500">No categories yet</p>
              ) : (
                <div className="space-y-2">
                  {categories.map(category => (
                    <div key={category.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                      <span>{category.name}</span>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setManageCategoriesOpen(false);
              resetCategoryForm();
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
