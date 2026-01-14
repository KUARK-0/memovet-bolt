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
import Auth from "./Auth";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { isAuthenticated, loading, signOut } = useAuth();
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
    return <Auth />;
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
