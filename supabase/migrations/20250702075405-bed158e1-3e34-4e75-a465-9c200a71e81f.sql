-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create wishlists table
CREATE TABLE public.wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'My Wishlist',
  slug TEXT NOT NULL UNIQUE,
  background_color TEXT DEFAULT '#fff2eb',
  logo_url TEXT,
  font_family TEXT DEFAULT 'geist',
  language TEXT DEFAULT 'tr',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Create policies for wishlists
CREATE POLICY "Users can view their own wishlists" 
ON public.wishlists 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public wishlists" 
ON public.wishlists 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can create their own wishlists" 
ON public.wishlists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlists" 
ON public.wishlists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlists" 
ON public.wishlists 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wishlist_id UUID NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(wishlist_id, slug)
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Users can view categories of their wishlists" 
ON public.categories 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.wishlists w 
    WHERE w.id = categories.wishlist_id 
    AND (w.user_id = auth.uid() OR w.is_public = true)
  )
);

CREATE POLICY "Users can create categories for their wishlists" 
ON public.categories 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wishlists w 
    WHERE w.id = categories.wishlist_id 
    AND w.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update categories of their wishlists" 
ON public.categories 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.wishlists w 
    WHERE w.id = categories.wishlist_id 
    AND w.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete categories of their wishlists" 
ON public.categories 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.wishlists w 
    WHERE w.id = categories.wishlist_id 
    AND w.user_id = auth.uid()
  )
);

-- Create items table
CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wishlist_id UUID NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  image_url TEXT,
  price TEXT,
  heart_count INTEGER DEFAULT 0,
  thumbs_up_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Create policies for items
CREATE POLICY "Users can view items of their wishlists" 
ON public.items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.wishlists w 
    WHERE w.id = items.wishlist_id 
    AND (w.user_id = auth.uid() OR w.is_public = true)
  )
);

CREATE POLICY "Users can create items for their wishlists" 
ON public.items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wishlists w 
    WHERE w.id = items.wishlist_id 
    AND w.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update items of their wishlists" 
ON public.items 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.wishlists w 
    WHERE w.id = items.wishlist_id 
    AND w.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete items of their wishlists" 
ON public.items 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.wishlists w 
    WHERE w.id = items.wishlist_id 
    AND w.user_id = auth.uid()
  )
);

-- Create item interactions table
CREATE TABLE public.item_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('heart', 'thumbs_up')),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(item_id, interaction_type, ip_address)
);

-- Enable RLS
ALTER TABLE public.item_interactions ENABLE ROW LEVEL SECURITY;

-- Create policy for item interactions (anyone can view and create)
CREATE POLICY "Anyone can view item interactions" 
ON public.item_interactions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create item interactions" 
ON public.item_interactions 
FOR INSERT 
WITH CHECK (true);

-- Create function to update interaction counts
CREATE OR REPLACE FUNCTION public.update_item_interaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.interaction_type = 'heart' THEN
      UPDATE public.items 
      SET heart_count = heart_count + 1 
      WHERE id = NEW.item_id;
    ELSIF NEW.interaction_type = 'thumbs_up' THEN
      UPDATE public.items 
      SET thumbs_up_count = thumbs_up_count + 1 
      WHERE id = NEW.item_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.interaction_type = 'heart' THEN
      UPDATE public.items 
      SET heart_count = GREATEST(0, heart_count - 1) 
      WHERE id = OLD.item_id;
    ELSIF OLD.interaction_type = 'thumbs_up' THEN
      UPDATE public.items 
      SET thumbs_up_count = GREATEST(0, thumbs_up_count - 1) 
      WHERE id = OLD.item_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for interaction counts
CREATE TRIGGER update_item_interaction_counts_trigger
  AFTER INSERT OR DELETE ON public.item_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_item_interaction_counts();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wishlists_updated_at
  BEFORE UPDATE ON public.wishlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

-- Create storage policies for logos
CREATE POLICY "Users can upload their own logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'logos');

CREATE POLICY "Users can update their own logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);