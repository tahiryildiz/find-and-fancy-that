import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Star, Users, Palette, Share2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-background">W</span>
          </div>
          <span className="text-xl font-bold text-foreground">Wishvue</span>
        </div>
        <Button variant="outline" onClick={() => navigate('/auth')}>
          Sign In
        </Button>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 mb-8">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Smart wishlist insights for better decisions</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Smart Wishlist
            <span className="text-primary block">Dashboard</span>
            & Insights
          </h1>
          
          <p className="text-xl text-brand-text mb-10 max-w-2xl mx-auto leading-relaxed">
            Create beautiful wishlists and get intelligent insights on what to buy next and why. 
            Track priorities, analyze trends, and make smarter purchasing decisions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 py-4 h-14">
              Start Creating Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-14">
              See Example
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-foreground mb-16">
          Everything you need for smart wishlist management
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-border hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <Palette className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Smart Analytics</h3>
            <p className="text-brand-text leading-relaxed">
              Get insights on your wishlist trends, priority scoring, and intelligent recommendations for what to buy next.
            </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-border hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <Share2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Dashboard Insights</h3>
            <p className="text-brand-text leading-relaxed">
              Visual dashboard showing purchase priorities, budget tracking, and decision-making insights.
            </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-border hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Easy Sharing</h3>
            <p className="text-brand-text leading-relaxed">
              Share your wishlist with a simple link. Friends can interact and help you prioritize decisions.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 border border-border max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to create your first wishlist?
          </h2>
          <p className="text-xl text-brand-text mb-8">
            Start making smarter purchasing decisions with intelligent wishlist insights.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 py-4 h-14">
            Get Started - It's Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-sm text-brand-text mt-4">
            No credit card required • Setup in under 2 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;