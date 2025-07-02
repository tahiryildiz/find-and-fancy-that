import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WishlistItem } from "@/types/wishlist";
import { useToast } from "@/hooks/use-toast";

interface AddItemDialogProps {
  onAddItem: (item: Omit<WishlistItem, 'id' | 'dateAdded'>) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
}

export function AddItemDialog({ onAddItem, categories, onAddCategory }: AddItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !url.trim() || !description.trim()) {
      toast({
        title: "Eksik alanlar",
        description: "Lütfen tüm gerekli alanları doldurun (başlık, URL ve açıklama).",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast({
        title: "Geçersiz URL",
        description: "Lütfen http:// veya https:// ile başlayan geçerli bir URL girin",
        variant: "destructive",
      });
      return;
    }

    onAddItem({
      title: title.trim(),
      url: url.trim(),
      image: image.trim() || undefined,
      description: description.trim(),
      category: category.trim() || undefined,
      price: price.trim() || undefined,
    });

    // Reset form
    setTitle("");
    setUrl("");
    setImage("");
    setDescription("");
    setCategory("");
    setPrice("");
    setNewCategory("");
    setShowNewCategory(false);
    setOpen(false);

    toast({
      title: "Ürün eklendi!",
      description: "İstek listesi ürününüz başarıyla eklendi.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="elegant" className="font-medium">
          <Plus className="h-4 w-4" />
          Yeni Ürün Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>İstek Listesine Ekle</DialogTitle>
          <DialogDescription>
            Çevrimiçi bulduğunuz ve sevdiğiniz ya da satın almak istediğiniz bir şeyi kaydedin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ürün adı"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select value={category} onValueChange={(value) => {
                if (value === "new") {
                  setShowNewCategory(true);
                  setCategory("");
                } else {
                  setCategory(value);
                  setShowNewCategory(false);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Yeni Kategori Ekle</SelectItem>
                </SelectContent>
              </Select>
              {showNewCategory && (
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Yeni kategori adı"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (newCategory.trim()) {
                        onAddCategory(newCategory.trim());
                        setCategory(newCategory.trim());
                        setNewCategory("");
                        setShowNewCategory(false);
                      }
                    }}
                  >
                    Ekle
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/item"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="image">Resim URL</Label>
              <Input
                id="image"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Fiyat</Label>
              <Input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="₺99"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bunu neden istiyorsunuz? Onu özel kılan nedir?"
              required
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit">İstek Listesine Ekle</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}