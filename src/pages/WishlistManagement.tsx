import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWishlistData } from '@/hooks/useWishlistData';
import { useItemOperations } from '@/hooks/useItemOperations';
import { useCategoryOperations } from '@/hooks/useCategoryOperations';
import { ItemFormModal } from '@/components/wishlist/ItemFormModal';
import { CategoryFormModal } from '@/components/wishlist/CategoryFormModal';
import { WishlistHeader } from '@/components/wishlist/WishlistHeader';
import { CategoryFilter } from '@/components/wishlist/CategoryFilter';
import { SearchAndSort } from '@/components/wishlist/SearchAndSort';
import { ItemGrid } from '@/components/wishlist/ItemGrid';
import { SortOption } from '@/types/wishlist';

// Sort options for the dropdown
const SORT_OPTIONS: SortOption[] = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
  { label: 'Price: high to low', value: 'price-desc' },
  { label: 'Price: low to high', value: 'price-asc' },
  { label: 'Alphabetical: A-Z', value: 'alpha-asc' },
  { label: 'Alphabetical: Z-A', value: 'alpha-desc' }
];

export default function WishlistManagement() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // State for UI controls
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Fetch wishlist data with custom hook
  const {
    loading,
    wishlist,
    items,
    setItems,
    categories,
    setCategories,
    error
  } = useWishlistData(slug);

  // Item operations with custom hook
  const {
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
  } = useItemOperations(wishlist?.id, items, setItems);

  // Category operations with custom hook
  const {
    categoryForm,
    setCategoryForm,
    isEditingCategory,
    resetCategoryForm,
    openAddCategoryForm,
    openEditCategoryForm,
    saveCategory,
    deleteCategory
  } = useCategoryOperations(wishlist?.id, categories, setCategories, items, setItems);

  // Handle item form field changes
  const handleItemFormChange = (field: keyof typeof itemForm, value: string) => {
    setItemForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle category form field changes
  const handleCategoryFormChange = (field: keyof typeof categoryForm, value: string) => {
    setCategoryForm(prev => ({ ...prev, [field]: value }));
  };

  // Filter and sort items based on selected criteria
  const filteredAndSortedItems = useMemo(() => {
    // First, filter by category if one is selected
    let filtered = items;
    
    if (selectedCategory === 'none') {
      filtered = items.filter(item => !item.category_id);
    } else if (selectedCategory) {
      filtered = items.filter(item => item.category_id === selectedCategory);
    }
    
    // Then, filter by search query if there is one
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description?.toLowerCase().includes(query) ||
        item.brand?.toLowerCase().includes(query)
      );
    }
    
    // Finally, sort the filtered items
    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'price-desc':
          return (parseFloat(b.price || '0') || 0) - (parseFloat(a.price || '0') || 0);
        case 'price-asc':
          return (parseFloat(a.price || '0') || 0) - (parseFloat(b.price || '0') || 0);
        case 'alpha-asc':
          return a.title.localeCompare(b.title);
        case 'alpha-desc':
          return b.title.localeCompare(a.title);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [items, selectedCategory, searchQuery, sortOption]);

  // Handle opening the add item form
  const handleAddItem = () => {
    openAddItemForm();
    setAddItemOpen(true);
  };

  // Handle opening the edit item form
  const handleEditItem = (item: typeof items[0]) => {
    openEditItemForm(item);
    setAddItemOpen(true);
  };

  // Handle saving an item (both add and edit)
  const handleSaveItem = async (e: React.FormEvent) => {
    const success = await saveItem(e);
    if (success) {
      setAddItemOpen(false);
    }
    return success;
  };

  // Handle opening the category management modal
  const handleManageCategories = () => {
    openAddCategoryForm();
    setCategoryModalOpen(true);
  };

  // If loading, show a loading state
  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  // If there's an error, show an error state
  if (error || !wishlist) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h2 className="text-red-600 text-xl font-semibold mb-2">Error Loading Wishlist</h2>
            <p className="text-gray-700">{error || 'Wishlist not found'}</p>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header with title and actions */}
      <WishlistHeader 
        wishlist={wishlist}
        onAddItemClick={handleAddItem}
        onManageCategoriesClick={handleManageCategories}
      />
      
      {/* Category filters */}
      <CategoryFilter
        categories={categories}
        items={items}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      
      {/* Search and sort controls */}
      <SearchAndSort
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOption={sortOption}
        onSortChange={setSortOption}
        sortOptions={SORT_OPTIONS}
      />
      
      {/* Item grid */}
      <ItemGrid 
        items={items}
        filteredItems={filteredAndSortedItems}
        categories={categories}
        onEditItem={handleEditItem}
        onDeleteItem={deleteItem}
      />
      
      {/* Item form modal (add/edit) */}
      <ItemFormModal
        open={addItemOpen}
        isEditing={isEditing}
        itemForm={itemForm}
        categories={categories}
        imagePreview={imagePreview}
        onOpenChange={setAddItemOpen}
        onSubmit={handleSaveItem}
        onChange={handleItemFormChange}
        onImageChange={handleImageChange}
        onRemoveImage={removeImage}
      />
      
      {/* Category form modal */}
      <CategoryFormModal
        open={categoryModalOpen}
        isEditing={isEditingCategory}
        categoryForm={categoryForm}
        onOpenChange={setCategoryModalOpen}
        onSubmit={saveCategory}
        onChange={handleCategoryFormChange}
      />
    </div>
  );
}
