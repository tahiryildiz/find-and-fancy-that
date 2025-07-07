import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ItemFormType, Category } from '@/types/wishlist';

interface ItemFormModalProps {
  open: boolean;
  isEditing: boolean;
  itemForm: ItemFormType;
  categories: Category[];
  imagePreview: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<boolean>;
  onChange: (field: keyof ItemFormType, value: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

export function ItemFormModal({
  open,
  isEditing,
  itemForm,
  categories,
  imagePreview,
  onOpenChange,
  onSubmit,
  onChange,
  onImageChange,
  onRemoveImage,
}: ItemFormModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    const success = await onSubmit(e);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" 
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title *
              </label>
              <Input
                id="title"
                value={itemForm.title}
                onChange={(e) => onChange('title', e.target.value)}
                placeholder="Item title"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="brand" className="block text-sm font-medium mb-1">
                  Brand
                </label>
                <Input
                  id="brand"
                  value={itemForm.brand}
                  onChange={(e) => onChange('brand', e.target.value)}
                  placeholder="Brand name"
                />
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium mb-1">
                  Price
                </label>
                <Input
                  id="price"
                  value={itemForm.price}
                  onChange={(e) => onChange('price', e.target.value)}
                  placeholder="$19.99"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="description"
                value={itemForm.description}
                onChange={(e) => onChange('description', e.target.value)}
                placeholder="Item description"
                className="min-h-[100px]"
              />
            </div>
            
            <div>
              <label htmlFor="url" className="block text-sm font-medium mb-1">
                URL
              </label>
              <Input
                id="url"
                type="url"
                value={itemForm.url}
                onChange={(e) => onChange('url', e.target.value)}
                placeholder="https://example.com/item"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                Category
              </label>
              <Select
                value={itemForm.category_id}
                onValueChange={(value) => onChange('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="image" className="block text-sm font-medium mb-1">
                Image
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  className="flex-1"
                />
                {(imagePreview || itemForm.image_url) && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={onRemoveImage}
                  >
                    <X className="h-4 w-4 mr-1" /> Remove
                  </Button>
                )}
              </div>
              
              {imagePreview && (
                <div className="mt-2 relative w-full h-[200px] rounded overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-contain bg-gray-50" 
                  />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Item' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
