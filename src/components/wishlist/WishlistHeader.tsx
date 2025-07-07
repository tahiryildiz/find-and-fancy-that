import React from 'react';
import { Share, ChevronDown, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Wishlist } from '@/types/wishlist';
import { useToast } from '@/hooks/use-toast';

interface WishlistHeaderProps {
  wishlist: Wishlist;
  onAddItemClick: () => void;
  onManageCategoriesClick: () => void;
}

export function WishlistHeader({ 
  wishlist, 
  onAddItemClick, 
  onManageCategoriesClick 
}: WishlistHeaderProps) {
  const { toast } = useToast();

  const handleShareByLink = async () => {
    const shareUrl = `${window.location.origin}/wishlist/${wishlist.slug}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description: "Wishlist link copied to clipboard"
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        title: "Copy failed",
        description: "Unable to copy the link to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleShareByEmail = () => {
    const shareUrl = `${window.location.origin}/wishlist/${wishlist.slug}`;
    const subject = `Check out my wishlist: ${wishlist.title}`;
    const body = `I wanted to share my wishlist with you: ${shareUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">{wishlist.title}</h1>
        {wishlist.description && (
          <p className="text-gray-600 mt-1">{wishlist.description}</p>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button onClick={onAddItemClick} className="gap-1">
          <PlusCircle className="h-4 w-4" /> Add Item
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleShareByLink}>
              <Share className="mr-2 h-4 w-4" /> Copy link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShareByEmail}>
              <Share className="mr-2 h-4 w-4" /> Share by email
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onManageCategoriesClick}>
              Manage categories
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
