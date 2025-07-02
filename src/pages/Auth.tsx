import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, displayName);
      }

      if (result.error) {
        toast({
          title: 'Hata',
          description: result.error.message,
          variant: 'destructive',
        });
      } else {
        if (isLogin) {
          navigate('/dashboard');
        } else {
          toast({
            title: 'Kayıt başarılı',
            description: 'Lütfen e-posta adresinizi doğrulayın.',
          });
        }
      }
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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {isLogin ? 'Hesabınıza giriş yapın' : 'Hesap oluşturun'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLogin 
              ? 'İstek listelerinize erişmek için e-posta adresinizi girin'
              : 'Başlamak için aşağıdaki bilgileri girin'
            }
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">İsim</Label>
                  <Input
                    id="displayName"
                    placeholder="Adınız"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={!isLogin}
                    disabled={loading}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  placeholder="isim@ornek.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Yükleniyor...' : (isLogin ? 'Giriş Yap' : 'Hesap Oluştur')}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="px-8 text-center text-sm text-muted-foreground">
          {isLogin ? (
            <>
              Hesabınız yok mu?{' '}
              <Button
                variant="link"
                onClick={() => setIsLogin(false)}
                className="p-0 h-auto font-normal underline-offset-4"
              >
                Kayıt olun
              </Button>
            </>
          ) : (
            <>
              Zaten hesabınız var mı?{' '}
              <Button
                variant="link"
                onClick={() => setIsLogin(true)}
                className="p-0 h-auto font-normal underline-offset-4"
              >
                Giriş yapın
              </Button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}