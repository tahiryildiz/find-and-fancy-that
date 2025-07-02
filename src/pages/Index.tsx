import { useState, useMemo } from "react";
import { WishlistItem as WishlistItemType, WishlistCategory } from "@/types/wishlist";
import { WishlistHeader } from "@/components/WishlistHeader";
import { WishlistItem } from "@/components/WishlistItem";
import { useToast } from "@/hooks/use-toast";

// Sample data to showcase the app
const sampleItems: WishlistItemType[] = [
  {
    id: "1",
    title: "Daylight Computer DC-1",
    url: "https://daylightcomputer.com/",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop",
    description: "A beautiful e-ink display that's easy on the eyes for long coding sessions. Perfect for distraction-free work.",
    dateAdded: new Date().toISOString(),
    category: "Tech",
    price: "$729"
  },
  {
    id: "2", 
    title: "Ceramic Coffee Cup",
    url: "https://store.moma.org/",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400&h=400&fit=crop",
    description: "Simple, elegant design that makes every morning coffee feel special. Love the minimal aesthetic.",
    dateAdded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Lifestyle",
    price: "$17"
  },
  {
    id: "3",
    title: "Magnetic Laptop Sleeve",
    url: "https://ugmonk.com/",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    description: "Clean design with magnetic closure. Would be perfect for carrying my MacBook around the city.",
    dateAdded: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Tech",
    price: "$89"
  }
];

const Index = () => {
  const [items, setItems] = useState<WishlistItemType[]>(sampleItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<WishlistCategory>("all");
  const [isAdmin, setIsAdmin] = useState(false); // Simple admin toggle
  const [categories, setCategories] = useState<string[]>(["Tech", "Lifestyle", "Moda", "Ev", "Diğer"]);
  const { toast } = useToast();

  const handleAddItem = (newItem: Omit<WishlistItemType, 'id' | 'dateAdded'>) => {
    const item: WishlistItemType = {
      ...newItem,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
    };
    setItems([item, ...items]);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast({
      title: "Ürün kaldırıldı",
      description: "Ürün istek listenizden kaldırıldı.",
    });
  };

  const handleAddCategory = (newCategory: string) => {
    if (!categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      toast({
        title: "Kategori eklendi",
        description: `"${newCategory}" kategorisi eklendi.`,
      });
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = 
        selectedCategory === "all" || 
        (item.category && item.category.toLowerCase() === selectedCategory) ||
        (selectedCategory === "other" && !item.category);

      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <WishlistHeader
          onAddItem={handleAddItem}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          itemCount={filteredItems.length}
          isAdmin={isAdmin}
          onToggleAdmin={setIsAdmin}
          categories={categories}
          onAddCategory={handleAddCategory}
        />

        {/* Items Grid */}
        <div className="mt-8">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-brand-subtle flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-brand-text border-dashed rounded"></div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery || selectedCategory !== "all" ? "Ürün bulunamadı" : "İstek listenizi başlatın"}
              </h3>
              <p className="text-brand-text max-w-md mx-auto">
                {searchQuery || selectedCategory !== "all" 
                  ? "Aradığınızı bulmak için arama veya kategori filtrenizi ayarlamayı deneyin."
                  : "Web'den sevdiğiniz ürünleri kaydedin. Başlamak için 'Yeni Ürün Ekle'ye tıklayın!"
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <WishlistItem
                  key={item.id}
                  item={item}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;