import { ExternalLink, Trash2 } from "lucide-react";
import { WishlistItem as WishlistItemType } from "@/types/wishlist";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface WishlistItemProps {
  item: WishlistItemType;
  onDelete: (id: string) => void;
}

export function WishlistItem({ item, onDelete }: WishlistItemProps) {
  const handleLinkClick = () => {
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  const isRecent = () => {
    const addedDate = new Date(item.dateAdded);
    const now = new Date();
    const diffInDays = (now.getTime() - addedDate.getTime()) / (1000 * 3600 * 24);
    return diffInDays <= 7;
  };

  return (
    <Card className="group overflow-hidden bg-card border-border hover:shadow-sm transition-all duration-200">
      <div className="relative">
        {/* Image */}
        {item.image && (
          <div className="aspect-square overflow-hidden bg-brand-subtle">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        
        {/* New Badge */}
        {isRecent() && (
          <Badge variant="new" className="absolute top-3 right-3 text-xs font-medium">
            YENİ
          </Badge>
        )}

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item.id)}
          className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/80 hover:bg-background"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-2">
        {/* Brand and Category */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-brand-text font-normal">
            {item.category || 'Marka'} · Kategori
          </span>
          {item.price && (
            <span className="text-sm font-medium text-foreground">{item.price}</span>
          )}
        </div>
        
        <button
          onClick={handleLinkClick}
          className="text-left w-full"
        >
          <h3 className="font-normal text-foreground hover:text-primary transition-colors duration-200 text-sm">
            {item.title}
          </h3>
        </button>
      </div>
    </Card>
  );
}