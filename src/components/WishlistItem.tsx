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
    <Card className="group overflow-hidden bg-gradient-card border-card-border hover:shadow-medium transition-all duration-300 hover:scale-[1.02]">
      <div className="relative">
        {/* Image */}
        {item.image && (
          <div className="aspect-square overflow-hidden bg-brand-subtle">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        
        {/* New Badge */}
        {isRecent() && (
          <Badge variant="new" className="absolute top-3 left-3 text-xs">
            NEW
          </Badge>
        )}

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item.id)}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/80 hover:bg-background"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-3">
        {/* Category and Title */}
        <div className="space-y-2">
          {item.category && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-brand-text uppercase tracking-wide">
                {item.category}
              </span>
              <ExternalLink className="h-3 w-3 text-brand-text" />
            </div>
          )}
          
          <button
            onClick={handleLinkClick}
            className="text-left w-full group-button"
          >
            <h3 className="font-semibold text-foreground hover:text-primary transition-colors duration-200 line-clamp-2">
              {item.title}
            </h3>
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Price */}
        {item.price && (
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="font-semibold text-foreground">{item.price}</span>
          </div>
        )}
      </div>
    </Card>
  );
}