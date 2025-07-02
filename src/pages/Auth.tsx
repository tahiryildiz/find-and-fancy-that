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
        result = await signUp(email, password);
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
    <div className="min-h-screen flex">
      {/* Left Column - Cover Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/30" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-foreground">
          <div className="max-w-md">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-background">W</span>
              </div>
              <span className="text-2xl font-bold">Wishvue</span>
            </div>
            <h2 className="text-4xl font-bold mb-6">
              Smart wishlist insights for better decisions
            </h2>
            <p className="text-lg text-brand-text leading-relaxed">
              Create beautiful wishlists and get intelligent insights on what to buy next and why. 
              Track priorities, analyze trends, and make smarter purchasing decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Auth Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center space-y-4 text-center">
            <div className="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-background">W</span>
            </div>
            <span className="text-2xl font-bold text-foreground">Wishvue</span>
          </div>

          {/* Auth Header */}
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-2 text-brand-text">
              {isLogin 
                ? 'Sign in to access your wishlists and insights'
                : 'Get started with Wishvue and create smart wishlists'
              }
            </p>
          </div>

          {/* Auth Form */}
          <Card className="border border-card-border shadow-lg bg-gradient-to-b from-background to-background/95">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
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
                    className="h-11"
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
                    className="h-11"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-medium" 
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
    </div>
  );
}