import React from 'react';
import { ItemCard } from './ItemCard';
import { WishlistItem, Category } from '@/types/wishlist';

interface ItemGridProps {
  items: WishlistItem[];
  filteredItems: WishlistItem[];
  categories: Category[];
  onEditItem: (item: WishlistItem) => void;
  onDeleteItem: (id: string) => void;
}

export function ItemGrid({ 
  items, 
  filteredItems, 
  categories, 
  onEditItem, 
  onDeleteItem 
}: ItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">No items in this wishlist yet.</p>
        <p className="text-gray-500 text-sm">Click the 'Add Item' button to add your first item.</p>
      </div>
    );
  }
  
  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">No items match your search or filter criteria.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredItems.map(item => (
        <ItemCard
          key={item.id}
          item={item}
          categories={categories}
          onEdit={onEditItem}
          onDelete={onDeleteItem}
        />
      ))}
    </div>
  );
}
