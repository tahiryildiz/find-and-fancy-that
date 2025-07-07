import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Category, WishlistItem } from '@/types/wishlist';

interface CategoryFilterProps {
  categories: Category[];
  items: WishlistItem[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryFilter({ 
  categories, 
  items, 
  selectedCategory, 
  onSelectCategory 
}: CategoryFilterProps) {
  // Only show categories that have associated items
  const categoriesWithItems = categories.filter(category => 
    items.some(item => item.category_id === category.id)
  );
  
  // Count items with no category
  const uncategorizedCount = items.filter(item => !item.category_id).length;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => onSelectCategory(null)}
      >
        All
        <Badge className="ml-2 bg-white text-black" variant="outline">
          {items.length}
        </Badge>
      </Button>
      
      {uncategorizedCount > 0 && (
        <Button
          variant={selectedCategory === 'none' ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectCategory('none')}
        >
          Uncategorized
          <Badge className="ml-2 bg-white text-black" variant="outline">
            {uncategorizedCount}
          </Badge>
        </Button>
      )}
      
      {categoriesWithItems.map((category) => {
        const itemCount = items.filter(item => item.category_id === category.id).length;
        
        if (itemCount === 0) return null;
        
        return (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            style={{
              backgroundColor: selectedCategory === category.id ? category.color : 'transparent',
              color: selectedCategory === category.id ? 'white' : 'inherit',
              borderColor: category.color,
            }}
            onClick={() => onSelectCategory(category.id)}
          >
            {category.name}
            <Badge className="ml-2 bg-white text-black" variant="outline">
              {itemCount}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
}
