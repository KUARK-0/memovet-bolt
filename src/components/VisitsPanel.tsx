import { useState } from 'react';
import { Visit, Client } from '../types';
import { Plus, Trash2, X, Check, Search, Calendar } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface VisitsPanelProps {
  visits: Visit[];
  clients: Client[];
  onAdd: (visit: Omit<Visit, 'id'>) => void;
  onDelete: (id: string) => void;
}

const VisitsPanel = ({ visits, clients, onAdd, onDelete }: VisitsPanelProps) => {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    clientId: '',
    summary: '',
    totalCost: 0
  });

  const filteredVisits = visits.filter(v => 
    v.clientName.toLowerCase().includes(search.toLowerCase()) ||
    v.summary.toLowerCase().includes(search.toLowerCase())
  );

  // Group visits by date
  const groupedVisits = filteredVisits.reduce((acc, visit) => {
    const date = new Date(visit.date).toLocaleDateString('tr-TR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(visit);
    return acc;
  }, {} as Record<string, Visit[]>);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === form.clientId);
    if (!client) {
      alert('Lütfen bir müşteri seçin');
      return;
    }
    
    onAdd({
      clientId: form.clientId,
      clientName: client.name,
      date: new Date().toISOString(),
      summary: form.summary,
      totalCost: form.totalCost,
      medications: []
    });
    setForm({ clientId: '', summary: '', totalCost: 0 });
    setShowForm(false);
  };

  const cancelForm = () => {
    setForm({ clientId: '', summary: '', totalCost: 0 });
    setShowForm(false);
  };

  const openForm = () => {
    if (clients.length > 0) {
      setForm({ ...form, clientId: clients[0].id });
    }
    setShowForm(true);
  };

  const totalRevenue = filteredVisits.reduce((acc, v) => acc + v.totalCost, 0);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Saha Ziyaretleri</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {visits.length} ziyaret • Toplam ₺{totalRevenue.toLocaleString('tr-TR')}
          </p>
        </div>
        <button onClick={openForm} className="btn-primary" disabled={clients.length === 0}>
          <Plus className="w-4 h-4" />
          Yeni Ziyaret
        </button>
      </div>

      {clients.length === 0 && (
        <div className="glass-card rounded-2xl p-4 border-warning/20 bg-warning/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-lg">
            ⚠️
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">Müşteri gerekli</p>
            <p className="text-xs text-muted-foreground">Ziyaret eklemek için önce müşteri eklemeniz gerekiyor</p>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="section-card space-y-5 animate-in">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-foreground text-lg">Yeni Ziyaret</h3>
            <button type="button" onClick={cancelForm} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Müşteri *</label>
              <select
                value={form.clientId}
                onChange={e => setForm({ ...form, clientId: e.target.value })}
                required
                className="input-modern"
              >
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tutar (₺)</label>
              <Input
                type="number"
                placeholder="0"
                value={form.totalCost || ''}
                onChange={e => setForm({ ...form, totalCost: parseFloat(e.target.value) || 0 })}
                className="input-modern"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Ziyaret Özeti *</label>
              <Input
                placeholder="Yapılan işlem, tedavi, notlar..."
                value={form.summary}
                onChange={e => setForm({ ...form, summary: e.target.value })}
                required
                className="input-modern"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={cancelForm} className="px-6">İptal</Button>
            <button type="submit" className="btn-primary">
              <Check className="w-4 h-4" />
              Kaydet
            </button>
          </div>
        </form>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Ziyaret ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-modern pl-11"
        />
      </div>

      {filteredVisits.length === 0 ? (
        <div className="section-card text-center py-16">
          <div className="text-5xl mb-4 opacity-50">🚜</div>
          <p className="text-muted-foreground font-medium">
            {search ? 'Arama sonucu bulunamadı' : 'Henüz ziyaret kaydı yok'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedVisits).map(([date, dateVisits]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground">{date}</h3>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="space-y-2">
                {dateVisits.map((visit, i) => (
                  <div 
                    key={visit.id} 
                    className="list-item group"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className="icon-box">🚜</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground">{visit.clientName}</h4>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{visit.summary}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">+₺{visit.totalCost.toLocaleString('tr-TR')}</p>
                    </div>
                    <button
                      onClick={() => onDelete(visit.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VisitsPanel;
