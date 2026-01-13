import { Medication, Client, Visit } from '../types';
import { Plus, ArrowRight, Sparkles } from 'lucide-react';

interface DashboardProps {
  medications: Medication[];
  clients: Client[];
  visits: Visit[];
  onNavigate: (tab: string) => void;
}

const Dashboard = ({ medications, clients, visits, onNavigate }: DashboardProps) => {
  const totalDebt = clients.reduce((acc, c) => acc + c.debt, 0);
  const lowStock = medications.filter(m => m.stock <= m.criticalLimit);
  const totalAnimals = clients.reduce((acc, c) => acc + c.totalAnimals, 0);
  const totalIncome = visits.reduce((acc, v) => acc + v.totalCost, 0);

  const stats = [
    { 
      label: 'Bekleyen Tahsilat', 
      value: `₺${totalDebt.toLocaleString('tr-TR')}`, 
      icon: '💰', 
      tab: 'clients',
      color: 'from-amber-500/20 to-orange-500/10',
      iconBg: 'bg-amber-500/10'
    },
    { 
      label: 'Toplam Hayvan', 
      value: `${totalAnimals}`, 
      suffix: 'Baş',
      icon: '🐄', 
      tab: 'clients',
      color: 'from-emerald-500/20 to-teal-500/10',
      iconBg: 'bg-emerald-500/10'
    },
    { 
      label: 'Kritik Stok', 
      value: `${lowStock.length}`, 
      suffix: 'İlaç',
      icon: '💊', 
      alert: lowStock.length > 0, 
      tab: 'medications',
      color: lowStock.length > 0 ? 'from-red-500/20 to-rose-500/10' : 'from-violet-500/20 to-purple-500/10',
      iconBg: lowStock.length > 0 ? 'bg-red-500/10' : 'bg-violet-500/10'
    },
    { 
      label: 'Toplam Gelir', 
      value: `₺${totalIncome.toLocaleString('tr-TR')}`, 
      icon: '📈', 
      tab: 'income',
      color: 'from-blue-500/20 to-cyan-500/10',
      iconBg: 'bg-blue-500/10'
    }
  ];

  const isEmpty = clients.length === 0 && medications.length === 0 && visits.length === 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-foreground tracking-tight">
              Memo<span className="gradient-text">Vet</span>
            </h1>
          </div>
          <p className="text-muted-foreground font-medium">
            Büyükbaş Veteriner Yönetim Sistemi
          </p>
        </div>
        <div className="glass-card px-5 py-2.5 rounded-full flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          <span className="text-xs font-bold text-foreground uppercase tracking-widest">Sistem Aktif</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 animate-in-delayed">
        {stats.map((stat, i) => (
          <button
            key={i}
            onClick={() => onNavigate(stat.tab)}
            className="stat-card text-left group"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className="relative">
              <div className="flex justify-between items-start mb-5">
                <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110`}>
                  {stat.icon}
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className={`text-2xl font-black tracking-tight ${stat.alert ? 'text-destructive' : 'text-foreground'}`}>
                  {stat.value}
                </h3>
                {stat.suffix && (
                  <span className="text-sm text-muted-foreground font-medium">{stat.suffix}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {isEmpty ? (
        /* Empty State */
        <div className="section-card text-center py-16 animate-in-delayed" style={{ animationDelay: '200ms' }}>
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl gradient-primary flex items-center justify-center text-5xl animate-float shadow-glow">
            🐄
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Hoş Geldiniz!</h2>
          <p className="text-muted-foreground mb-10 max-w-md mx-auto text-balance">
            Henüz veri eklenmemiş. Müşteri, ilaç ve ziyaret kayıtlarınızı ekleyerek başlayın.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => onNavigate('clients')} className="btn-primary">
              <Plus className="w-4 h-4" />
              Müşteri Ekle
            </button>
            <button onClick={() => onNavigate('medications')} className="btn-secondary">
              <Plus className="w-4 h-4" />
              İlaç Ekle
            </button>
          </div>
        </div>
      ) : (
        /* Main Content Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Visits */}
          <section className="lg:col-span-2 section-card animate-in-delayed" style={{ animationDelay: '200ms' }}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Son Ziyaretler</h2>
                <p className="text-sm text-muted-foreground mt-1">{visits.length} toplam kayıt</p>
              </div>
              <button 
                onClick={() => onNavigate('visits')}
                className="group flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Tümünü Gör
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            {visits.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 opacity-50">🚜</div>
                <p className="text-muted-foreground">Henüz ziyaret kaydı yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visits.slice(0, 4).map((visit, i) => (
                  <div 
                    key={visit.id} 
                    className="list-item"
                    style={{ animationDelay: `${(i + 4) * 50}ms` }}
                  >
                    <div className="icon-box">🚜</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">{visit.clientName}</h4>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{visit.summary}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">₺{visit.totalCost.toLocaleString('tr-TR')}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(visit.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* AI Assistant Card */}
          <section className="relative overflow-hidden rounded-3xl gradient-primary p-8 text-primary-foreground flex flex-col justify-between shadow-glow-lg animate-in-delayed" style={{ animationDelay: '300ms' }}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl mb-8 shadow-inner-glow">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">MemoAI</h3>
              <p className="text-primary-foreground/80 text-sm leading-relaxed">
                Yerel asistanınız. Tanı koyma ve vaka raporu hazırlama için her an hazır.
              </p>
            </div>
            <button 
              onClick={() => onNavigate('assistant')}
              className="relative w-full py-4 bg-white/95 text-primary font-bold rounded-xl hover:bg-white transition-colors mt-8 shadow-lg"
            >
              Asistanı Başlat
            </button>
          </section>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
