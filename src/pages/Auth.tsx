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
          title: 'Error',
          description: result.error.message,
          variant: 'destructive',
        });
      } else {
        if (isLogin) {
          navigate('/dashboard');
        } else {
          toast({
            title: 'Account created successfully',
            description: 'Please check your email to verify your account.',
          });
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center px-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[420px]">
        {/* Logo/Brand Section */}
        <div className="flex flex-col space-y-4 text-center">
          <div className="mx-auto w-12 h-12 bg-foreground rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl font-bold text-background">W</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-brand-text max-w-sm mx-auto">
            {isLogin 
              ? 'Sign in to access your wishlists and continue creating'
              : 'Get started with Wishly and create beautiful wishlists in minutes'
            }
          </p>
        </div>

        {/* Auth Form */}
        <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-sm font-medium text-foreground">Name</Label>
                  <Input
                    id="displayName"
                    placeholder="Your full name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={!isLogin}
                    disabled={loading}
                    className="h-12 rounded-lg border-card-border bg-background/50 focus:bg-background transition-colors"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12 rounded-lg border-card-border bg-background/50 focus:bg-background transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12 rounded-lg border-card-border bg-background/50 focus:bg-background transition-colors"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium" 
                disabled={loading}
              >
                {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Switch Mode */}
        <div className="text-center">
          <span className="text-sm text-brand-text">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="p-0 h-auto font-medium text-primary hover:text-primary/80"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </Button>
        </div>
      </div>
    </div>
  );
}