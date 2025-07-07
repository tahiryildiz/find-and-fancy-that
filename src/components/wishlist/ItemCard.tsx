import React from 'react';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WishlistItem, Category } from '@/types/wishlist';

interface ItemCardProps {
  item: WishlistItem;
  categories: Category[];
  onEdit: (item: WishlistItem) => void;
  onDelete: (id: string) => void;
}

export function ItemCard({ item, categories, onEdit, onDelete }: ItemCardProps) {
  const category = categories.find(c => c.id === item.category_id);
  
  const handleCardClick = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  
  return (
    <Card 
      className={`overflow-hidden transition-all hover:shadow-md ${item.url ? 'cursor-pointer' : ''}`} 
      onClick={() => item.url && handleCardClick(item.url)}
    >
      {item.image_url && (
        <div className="relative w-full pb-[60%] overflow-hidden bg-gray-100">
          <img 
            src={item.image_url} 
            alt={item.title} 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex justify-between">
          <h3 className="text-lg font-medium truncate">{item.title}</h3>
        </div>
        {item.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {item.description}
          </p>
        )}
        <div className="mt-2 space-y-1">
          {item.price && (
            <div className="text-sm font-medium">{item.price}</div>
          )}
          {category && (
            <Badge 
              style={{ backgroundColor: category.color || '#4f46e5' }}
              className="text-white"
            >
              {category.name}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between">
        <div className="flex space-x-1">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {item.url && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8" 
            onClick={(e) => {
              e.stopPropagation();
              window.open(item.url, '_blank', 'noopener,noreferrer');
            }}
          >
            <ExternalLink className="h-4 w-4 mr-1" /> Visit
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
