import { Visit } from '../types';
import { TrendingUp, Calendar, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface IncomePanelProps {
  visits: Visit[];
}

const IncomePanel = ({ visits }: IncomePanelProps) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthVisits = visits.filter(v => {
    const date = new Date(v.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  const thisMonthTotal = thisMonthVisits.reduce((acc, v) => acc + v.totalCost, 0);

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastMonthVisits = visits.filter(v => {
    const date = new Date(v.date);
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  });
  const lastMonthTotal = lastMonthVisits.reduce((acc, v) => acc + v.totalCost, 0);

  const allTimeTotal = visits.reduce((acc, v) => acc + v.totalCost, 0);

  const monthlyChange = lastMonthTotal > 0 
    ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100)
    : thisMonthTotal > 0 ? 100 : 0;

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(currentYear, currentMonth - i, 1);
    const month = date.getMonth();
    const year = date.getFullYear();
    const monthVisits = visits.filter(v => {
      const vDate = new Date(v.date);
      return vDate.getMonth() === month && vDate.getFullYear() === year;
    });
    const total = monthVisits.reduce((acc, v) => acc + v.totalCost, 0);
    return {
      label: date.toLocaleDateString('tr-TR', { month: 'short' }),
      fullLabel: date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
      total,
      count: monthVisits.length
    };
  }).reverse();

  const maxTotal = Math.max(...last6Months.map(m => m.total), 1);

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Gelir Takibi</h2>
        <p className="text-muted-foreground text-sm mt-1">Kazançlarınızı analiz edin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Bu Ay</p>
          <p className="text-3xl font-black text-foreground">₺{thisMonthTotal.toLocaleString('tr-TR')}</p>
          <p className="text-sm text-muted-foreground mt-2">{thisMonthVisits.length} ziyaret</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl ${monthlyChange >= 0 ? 'bg-success/10' : 'bg-destructive/10'} flex items-center justify-center`}>
              {monthlyChange >= 0 ? (
                <ArrowUpRight className="w-6 h-6 text-success" />
              ) : (
                <ArrowDownRight className="w-6 h-6 text-destructive" />
              )}
            </div>
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Değişim</p>
          <p className={`text-3xl font-black ${monthlyChange >= 0 ? 'text-success' : 'text-destructive'}`}>
            {monthlyChange >= 0 ? '+' : ''}{monthlyChange.toFixed(1)}%
          </p>
          <p className="text-sm text-muted-foreground mt-2">Geçen aya göre</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Toplam</p>
          <p className="text-3xl font-black text-foreground">₺{allTimeTotal.toLocaleString('tr-TR')}</p>
          <p className="text-sm text-muted-foreground mt-2">{visits.length} toplam ziyaret</p>
        </div>
      </div>

      <div className="section-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-foreground text-lg">Son 6 Ay</h3>
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
        </div>
        {visits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4 opacity-50">📊</div>
            <p className="text-muted-foreground font-medium">Ziyaret ekledikçe grafiğiniz burada görünecek</p>
          </div>
        ) : (
          <div className="space-y-4">
            {last6Months.map((month, i) => (
              <div key={i} className="group">
                <div className="flex items-center gap-4">
                  <span className="w-10 text-sm font-medium text-muted-foreground">{month.label}</span>
                  <div className="flex-1 h-10 bg-muted/50 rounded-xl overflow-hidden relative">
                    <div 
                      className="h-full gradient-primary rounded-xl transition-all duration-700 ease-out flex items-center justify-end pr-3"
                      style={{ width: `${Math.max((month.total / maxTotal) * 100, 5)}%` }}
                    >
                      {month.total > 0 && (
                        <span className="text-xs font-bold text-primary-foreground whitespace-nowrap">
                          ₺{month.total.toLocaleString('tr-TR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="w-16 text-right text-sm font-semibold text-foreground">
                    {month.count} <span className="text-muted-foreground font-normal">ziy.</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {visits.length > 0 && (
        <div className="section-card">
          <h3 className="font-bold text-foreground text-lg mb-4">Son İşlemler</h3>
          <div className="space-y-1">
            {visits.slice(0, 5).map(visit => (
              <div key={visit.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">
                    🚜
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{visit.clientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(visit.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-success">+₺{visit.totalCost.toLocaleString('tr-TR')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomePanel;
