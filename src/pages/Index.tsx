import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
        <h1 className="text-5xl font-light text-foreground mb-6">
          İstek Listesi Platformu
        </h1>
        <p className="text-xl text-brand-text mb-8 max-w-2xl mx-auto">
          Kendi özelleştirilebilir istek listelerinizi oluşturun, paylaşın ve sevdiklerinizin tepkilerini görün.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="p-6 rounded-lg bg-card border">
            <h3 className="text-xl font-medium text-foreground mb-3">Özelleştirin</h3>
            <p className="text-brand-text">
              Arkaplan rengi, logo ve dil seçenekleriyle listenizi kişiselleştirin.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card border">
            <h3 className="text-xl font-medium text-foreground mb-3">Paylaşın</h3>
            <p className="text-brand-text">
              Herkese açık link ile sevdiklerinizle kolayca paylaşın.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card border">
            <h3 className="text-xl font-medium text-foreground mb-3">Etkileşim</h3>
            <p className="text-brand-text">
              Ziyaretçiler ürünlerinizi beğenebilir ve tepki verebilir.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
            Ücretsiz Başlayın
          </Button>
          <p className="text-sm text-brand-text">
            Hesap oluşturmak ücretsizdir • Dakikalar içinde hazır
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;