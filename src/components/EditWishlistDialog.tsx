import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Wishlist, Language } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { languages } from '@/utils/i18n';
import { Upload } from 'lucide-react';

interface EditWishlistDialogProps {
  wishlist: Wishlist;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWishlistUpdated: (wishlist: Wishlist) => void;
}

export function EditWishlistDialog({ wishlist, open, onOpenChange, onWishlistUpdated }: EditWishlistDialogProps) {
  const [title, setTitle] = useState(wishlist.title);
  const [backgroundColor, setBackgroundColor] = useState(wishlist.background_color);
  const [language, setLanguage] = useState<Language>(wishlist.language as Language);
  const [isPublic, setIsPublic] = useState(wishlist.is_public);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadLogo = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${wishlist.user_id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: 'Logo yüklenirken bir hata oluştu.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let logoUrl = wishlist.logo_url;
      
      if (logoFile) {
        const uploadedUrl = await uploadLogo(logoFile);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        }
      }

      const { data, error } = await supabase
        .from('wishlists')
        .update({
          title: title.trim(),
          background_color: backgroundColor,
          language,
          is_public: isPublic,
          logo_url: logoUrl,
        })
        .eq('id', wishlist.id)
        .select()
        .single();

      if (error) throw error;

      onWishlistUpdated(data);
      toast({
        title: 'Başarılı',
        description: 'İstek listesi güncellendi.',
      });
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        toast({
          title: 'Hata',
          description: 'Dosya boyutu 1MB\'dan küçük olmalıdır.',
          variant: 'destructive',
        });
        return;
      }
      setLogoFile(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>İstek Listesini Düzenle</DialogTitle>
          <DialogDescription>
            İstek listenizin ayarlarını özelleştirin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Liste Başlığı</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="backgroundColor">Arkaplan Rengi</Label>
            <div className="flex gap-2">
              <Input
                id="backgroundColor"
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#fff2eb"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-2">
              {wishlist.logo_url && !logoFile && (
                <img 
                  src={wishlist.logo_url} 
                  alt="Current logo" 
                  className="w-10 h-10 object-contain rounded border"
                />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {logoFile ? logoFile.name : 'Logo Seç'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              PNG, JPG veya SVG. Maksimum 1MB.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Dil</Label>
            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label[language]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isPublic">Herkese Açık</Label>
              <p className="text-xs text-muted-foreground">
                Herkes bu listeyi görüntüleyebilir
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading || uploading || !title.trim()}>
              {loading ? 'Güncelleniyor...' : 'Güncelle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}