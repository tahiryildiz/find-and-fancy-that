import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddItemDialog } from "./AddItemDialog";
import { WishlistItem, WishlistCategory } from "@/types/wishlist";

interface WishlistHeaderProps {
  onAddItem: (item: Omit<WishlistItem, 'id' | 'dateAdded'>) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: WishlistCategory;
  onCategoryChange: (category: WishlistCategory) => void;
  itemCount: number;
  isAdmin: boolean;
  onToggleAdmin: (isAdmin: boolean) => void;
}

const categories: { value: WishlistCategory; label: string }[] = [
  { value: 'all', label: 'Everything' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'tech', label: 'Tech' },
  { value: 'home', label: 'Home' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'other', label: 'Other' },
];

export function WishlistHeader({
  onAddItem,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  itemCount,
  isAdmin,
  onToggleAdmin,
}: WishlistHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Title and Admin Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-foreground">The Inventory</h1>
          <p className="text-sm text-brand-text mt-1 font-light">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleAdmin(!isAdmin)}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              isAdmin 
                ? 'bg-primary text-primary-foreground' 
                : 'text-brand-text hover:text-foreground hover:bg-brand-subtle'
            }`}
          >
            {isAdmin ? 'Admin' : 'View Only'}
          </button>
          {isAdmin && <AddItemDialog onAddItem={onAddItem} />}
        </div>
      </div>

      {/* Categories */}
      <nav className="flex flex-wrap gap-6 text-sm">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={`font-light transition-colors duration-200 ${
              selectedCategory === category.value
                ? 'text-foreground underline underline-offset-4'
                : 'text-brand-text hover:text-foreground'
            }`}
          >
            {category.label}
          </button>
        ))}
      </nav>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text" />
        <Input
          placeholder="Search your wishlist..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}