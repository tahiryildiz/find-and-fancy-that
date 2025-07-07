import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WishlistItem, ItemFormType } from '@/types/wishlist';

export function useItemOperations(
  wishlistId: string | undefined,
  items: WishlistItem[],
  setItems: React.Dispatch<React.SetStateAction<WishlistItem[]>>
) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setImageFile(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setItemForm(prev => ({ ...prev, image_url: '' }));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error, data } = await supabase.storage
      .from('item-images')
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('item-images')
      .getPublicUrl(fileName);
      
    return publicUrl;
  };

  const openAddItemForm = () => {
    resetItemForm();
    setIsEditing(false);
  };

  const openEditItemForm = (item: WishlistItem) => {
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
    if (item.image_url) {
      setImagePreview(item.image_url);
    }
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishlistId) {
      toast({ 
        title: "Error", 
        description: "Wishlist ID is missing", 
        variant: "destructive" 
      });
      return;
    }
    
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
            wishlist_id: wishlistId,
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
      
      // Reset form
      resetItemForm();
      return true;
      
    } catch (error: any) {
      console.error('Error saving item:', error);
      toast({ 
        title: "Error", 
        description: `Failed to ${isEditing ? 'update' : 'add'} item`, 
        variant: "destructive" 
      });
      return false;
    }
  };

  const deleteItem = async (itemId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this item?');
    if (!confirmed) return;

    try {
      const { error } = await supabase.from('items').delete().eq('id', itemId);
      
      if (error) throw error;
      
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

  return {
    itemForm,
    setItemForm,
    isEditing,
    imageFile,
    imagePreview,
    resetItemForm,
    handleImageChange,
    removeImage,
    openAddItemForm,
    openEditItemForm,
    saveItem,
    deleteItem
  };
}
