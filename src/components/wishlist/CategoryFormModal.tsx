import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryFormType } from '@/types/wishlist';

interface CategoryFormModalProps {
  open: boolean;
  isEditing: boolean;
  categoryForm: CategoryFormType;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<boolean>;
  onChange: (field: keyof CategoryFormType, value: string) => void;
}

export function CategoryFormModal({
  open,
  isEditing,
  categoryForm,
  onOpenChange,
  onSubmit,
  onChange,
}: CategoryFormModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    const success = await onSubmit(e);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px]" 
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="categoryName" className="block text-sm font-medium mb-1">
                Name *
              </label>
              <Input
                id="categoryName"
                value={categoryForm.name}
                onChange={(e) => onChange('name', e.target.value)}
                placeholder="Category name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="categoryColor" className="block text-sm font-medium mb-1">
                Color
              </label>
              <div className="flex gap-2">
                <input
                  id="categoryColor"
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => onChange('color', e.target.value)}
                  className="w-12 h-9 p-1 border rounded"
                />
                <Input
                  value={categoryForm.color}
                  onChange={(e) => onChange('color', e.target.value)}
                  placeholder="#4f46e5"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Category' : 'Add Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
