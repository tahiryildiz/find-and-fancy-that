import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Category, CategoryFormType, WishlistItem } from '@/types/wishlist';

export function useCategoryOperations(
  wishlistId: string | undefined,
  categories: Category[],
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>,
  items: WishlistItem[],
  setItems: React.Dispatch<React.SetStateAction<WishlistItem[]>>
) {
  const { toast } = useToast();
  const [categoryForm, setCategoryForm] = useState<CategoryFormType>({
    id: '',
    name: '',
    color: '#4f46e5' // Default indigo color
  });
  const [isEditingCategory, setIsEditingCategory] = useState(false);

  const resetCategoryForm = () => {
    setCategoryForm({
      id: '',
      name: '',
      color: '#4f46e5'
    });
    setIsEditingCategory(false);
  };

  const openAddCategoryForm = () => {
    resetCategoryForm();
    setIsEditingCategory(false);
  };

  const openEditCategoryForm = (category: Category) => {
    setCategoryForm({
      id: category.id,
      name: category.name,
      color: category.color || '#4f46e5'
    });
    setIsEditingCategory(true);
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishlistId) {
      toast({ 
        title: "Error", 
        description: "Wishlist ID is missing", 
        variant: "destructive" 
      });
      return;
    }

    if (!categoryForm.name) {
      toast({ 
        title: "Missing information", 
        description: "Please provide a name for the category", 
        variant: "destructive" 
      });
      return;
    }

    try {
      if (isEditingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            name: categoryForm.name,
            color: categoryForm.color
          })
          .eq('id', categoryForm.id);

        if (error) throw error;

        // Update local state
        setCategories(prev => 
          prev.map(cat => cat.id === categoryForm.id ? { ...cat, ...categoryForm } : cat)
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
            wishlist_id: wishlistId,
            name: categoryForm.name,
            color: categoryForm.color
          }])
          .select()
          .single();

        if (error) throw error;

        // Update local state
        setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));

        toast({ 
          title: "Category added", 
          description: "New category added to your wishlist" 
        });
      }

      // Reset form
      resetCategoryForm();
      return true;
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast({ 
        title: "Error", 
        description: `Failed to ${isEditingCategory ? 'update' : 'add'} category`, 
        variant: "destructive" 
      });
      return false;
    }
  };

  const deleteCategory = async (categoryId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this category? Items in this category will be uncategorized.');
    if (!confirmed) return;

    try {
      // First update all items in this category to have no category
      const itemsToUpdate = items.filter(item => item.category_id === categoryId);
      
      if (itemsToUpdate.length > 0) {
        const { error: itemsError } = await supabase
          .from('items')
          .update({ category_id: null })
          .eq('category_id', categoryId);
        
        if (itemsError) throw itemsError;
        
        // Update items in local state
        setItems(prev => prev.map(item => 
          item.category_id === categoryId ? { ...item, category_id: null } : item
        ));
      }
      
      // Then delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
      
      // Update categories in local state
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      
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

  return {
    categoryForm,
    setCategoryForm,
    isEditingCategory,
    resetCategoryForm,
    openAddCategoryForm,
    openEditCategoryForm,
    saveCategory,
    deleteCategory
  };
}
