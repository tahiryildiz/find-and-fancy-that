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
}: WishlistHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Wishlist</h1>
          <p className="text-brand-text mt-1">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        <AddItemDialog onAddItem={onAddItem} />
      </div>

      {/* Categories */}
      <nav className="flex flex-wrap gap-2 border-b border-border pb-4">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
              selectedCategory === category.value
                ? 'bg-primary text-primary-foreground'
                : 'text-brand-text hover:text-foreground hover:bg-brand-subtle'
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