import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import ClientsPanel from "@/components/ClientsPanel";
import AnimalsPanel from "@/components/AnimalsPanel";
import AdvancedVisitsPanel from "@/components/AdvancedVisitsPanel";
import AdvancedMedicationsPanel from "@/components/AdvancedMedicationsPanel";
import FinancialManagementPanel from "@/components/FinancialManagementPanel";
import AIAssistant from "@/components/AIAssistant";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const { isAuthenticated, loading, error, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "clients":
        return <ClientsPanel />;
      case "animals":
        return <AnimalsPanel />;
      case "visits":
        return <AdvancedVisitsPanel />;
      case "medications":
        return <AdvancedMedicationsPanel />;
      case "financial":
        return <FinancialManagementPanel />;
      case "assistant":
        return <AIAssistant />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Büyükbaş Veteriner</h1>
            <p className="text-muted-foreground">Sistemine Hoşgeldiniz</p>
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-muted p-6 rounded-lg text-center text-sm text
-muted-foreground">
            <p>Lütfen Supabase üzerinden oturum açın veya kaydolun.</p>
            <p className="mt-2">Demo hesabı kullanabilirsiniz.</p>
          </div>

          <Button
            onClick={() => signOut()}
            variant="outline"
            className="w-full"
          >
            Oturum Aç / Kaydol
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8 overflow-x-hidden">
        <div className="md:hidden flex justify-end mb-4 gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
          >
            Çıkış Yap
          </Button>
        </div>
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
