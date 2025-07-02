import { Language, LanguageTexts } from '@/types/database';

export const texts: LanguageTexts = {
  // Navigation & Auth
  signIn: { tr: 'Giriş Yap', en: 'Sign In', de: 'Anmelden', fr: 'Se connecter', es: 'Iniciar sesión' },
  signUp: { tr: 'Kayıt Ol', en: 'Sign Up', de: 'Registrieren', fr: "S'inscrire", es: 'Registrarse' },
  signOut: { tr: 'Çıkış Yap', en: 'Sign Out', de: 'Abmelden', fr: 'Se déconnecter', es: 'Cerrar sesión' },
  dashboard: { tr: 'Kontrol Paneli', en: 'Dashboard', de: 'Dashboard', fr: 'Tableau de bord', es: 'Panel' },
  
  // Wishlist
  myWishlists: { tr: 'İstek Listelerim', en: 'My Wishlists', de: 'Meine Wunschlisten', fr: 'Mes listes', es: 'Mis listas' },
  createWishlist: { tr: 'İstek Listesi Oluştur', en: 'Create Wishlist', de: 'Wunschliste erstellen', fr: 'Créer une liste', es: 'Crear lista' },
  editWishlist: { tr: 'İstek Listesini Düzenle', en: 'Edit Wishlist', de: 'Wunschliste bearbeiten', fr: 'Modifier la liste', es: 'Editar lista' },
  wishlistTitle: { tr: 'Liste Başlığı', en: 'Wishlist Title', de: 'Wunschliste Titel', fr: 'Titre de la liste', es: 'Título de la lista' },
  backgroundColor: { tr: 'Arkaplan Rengi', en: 'Background Color', de: 'Hintergrundfarbe', fr: 'Couleur de fond', es: 'Color de fondo' },
  uploadLogo: { tr: 'Logo Yükle', en: 'Upload Logo', de: 'Logo hochladen', fr: 'Télécharger logo', es: 'Subir logo' },
  language: { tr: 'Dil', en: 'Language', de: 'Sprache', fr: 'Langue', es: 'Idioma' },
  
  // Categories & Items
  categories: { tr: 'Kategoriler', en: 'Categories', de: 'Kategorien', fr: 'Catégories', es: 'Categorías' },
  addCategory: { tr: 'Kategori Ekle', en: 'Add Category', de: 'Kategorie hinzufügen', fr: 'Ajouter catégorie', es: 'Añadir categoría' },
  addItem: { tr: 'Ürün Ekle', en: 'Add Item', de: 'Artikel hinzufügen', fr: 'Ajouter article', es: 'Añadir artículo' },
  itemTitle: { tr: 'Ürün Başlığı', en: 'Item Title', de: 'Artikel Titel', fr: "Titre de l'article", es: 'Título del artículo' },
  description: { tr: 'Açıklama', en: 'Description', de: 'Beschreibung', fr: 'Description', es: 'Descripción' },
  price: { tr: 'Fiyat', en: 'Price', de: 'Preis', fr: 'Prix', es: 'Precio' },
  imageUrl: { tr: 'Resim URL', en: 'Image URL', de: 'Bild URL', fr: 'URL image', es: 'URL imagen' },
  url: { tr: 'Web Sitesi', en: 'Website', de: 'Webseite', fr: 'Site web', es: 'Sitio web' },
  
  // Actions
  save: { tr: 'Kaydet', en: 'Save', de: 'Speichern', fr: 'Enregistrer', es: 'Guardar' },
  cancel: { tr: 'İptal', en: 'Cancel', de: 'Abbrechen', fr: 'Annuler', es: 'Cancelar' },
  delete: { tr: 'Sil', en: 'Delete', de: 'Löschen', fr: 'Supprimer', es: 'Eliminar' },
  edit: { tr: 'Düzenle', en: 'Edit', de: 'Bearbeiten', fr: 'Modifier', es: 'Editar' },
  share: { tr: 'Paylaş', en: 'Share', de: 'Teilen', fr: 'Partager', es: 'Compartir' },
  copy: { tr: 'Kopyala', en: 'Copy', de: 'Kopieren', fr: 'Copier', es: 'Copiar' },
  
  // Messages
  copied: { tr: 'Kopyalandı!', en: 'Copied!', de: 'Kopiert!', fr: 'Copié!', es: '¡Copiado!' },
  noItems: { tr: 'Ürün bulunamadı', en: 'No items found', de: 'Keine Artikel gefunden', fr: 'Aucun article trouvé', es: 'No se encontraron artículos' },
  
  // Languages
  turkish: { tr: 'Türkçe', en: 'Turkish', de: 'Türkisch', fr: 'Turc', es: 'Turco' },
  english: { tr: 'İngilizce', en: 'English', de: 'Englisch', fr: 'Anglais', es: 'Inglés' },
  german: { tr: 'Almanca', en: 'German', de: 'Deutsch', fr: 'Allemand', es: 'Alemán' },
  french: { tr: 'Fransızca', en: 'French', de: 'Französisch', fr: 'Français', es: 'Francés' },
  spanish: { tr: 'İspanyolca', en: 'Spanish', de: 'Spanisch', fr: 'Espagnol', es: 'Español' },
};

export function t(key: string, lang: Language): string {
  return texts[key]?.[lang] || key;
}

export const languages: { value: Language; label: { [K in Language]: string } }[] = [
  { value: 'tr', label: texts.turkish },
  { value: 'en', label: texts.english },
  { value: 'de', label: texts.german },
  { value: 'fr', label: texts.french },
  { value: 'es', label: texts.spanish },
];