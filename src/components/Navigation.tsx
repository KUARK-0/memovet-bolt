import { Home, Users, Pill, Truck, Bot, TrendingUp, Stethoscope, BarChart3 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: Home },
    { id: 'clients', label: 'Müşteriler', icon: Users },
    { id: 'animals', label: 'Hayvanlar', icon: Stethoscope },
    { id: 'visits', label: 'Ziyaretler', icon: Truck },
    { id: 'medications', label: 'İlaçlar', icon: Pill },
    { id: 'financial', label: 'Mali', icon: BarChart3 },
    { id: 'assistant', label: 'Asistan', icon: Bot },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-72 bg-card border-r border-border/50 flex-col z-50">
        <div className="p-6 border-b border-border/50">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Memo<span className="gradient-text">Vet</span>
              </h1>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Veteriner Yönetimi</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto scrollbar-thin">
          <ul className="space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => onTabChange(tab.id)}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="p-4 border-t border-border/50">
          <div className="glass-card rounded-xl p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">MemoVet Pro</p>
            <p className="text-[10px] text-muted-foreground/70">v1.0.0 • Yerel Mod</p>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 px-2 py-2 z-50 safe-area-pb">
        <ul className="flex justify-around">
          {tabs.slice(0, 6).map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id}>
                <button
                  onClick={() => onTabChange(tab.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-primary/10' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold">{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop Spacer */}
      <div className="hidden md:block w-72 flex-shrink-0" />
    </>
  );
};

export default Navigation;
