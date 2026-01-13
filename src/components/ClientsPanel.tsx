import { useState } from 'react';
import { Client } from '../types';
import { Plus, Trash2, Edit2, X, Check, Search, Phone, MapPin } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface ClientsPanelProps {
  clients: Client[];
  onAdd: (client: Omit<Client, 'id'>) => void;
  onUpdate: (id: string, client: Partial<Client>) => void;
  onDelete: (id: string) => void;
}

const ClientsPanel = ({ clients, onAdd, onUpdate, onDelete }: ClientsPanelProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    totalAnimals: 0,
    debt: 0
  });

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(editingId, form);
      setEditingId(null);
    } else {
      onAdd(form);
    }
    setForm({ name: '', phone: '', address: '', totalAnimals: 0, debt: 0 });
    setShowForm(false);
  };

  const startEdit = (client: Client) => {
    setEditingId(client.id);
    setForm({
      name: client.name,
      phone: client.phone,
      address: client.address,
      totalAnimals: client.totalAnimals,
      debt: client.debt
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', phone: '', address: '', totalAnimals: 0, debt: 0 });
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Müşteriler</h2>
          <p className="text-muted-foreground text-sm mt-1">{clients.length} kayıtlı müşteri</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Yeni Müşteri
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="section-card space-y-5 animate-in">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-foreground text-lg">
              {editingId ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
            </h3>
            <button type="button" onClick={cancelEdit} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">İsim Soyisim *</label>
              <Input
                placeholder="Ahmet Yılmaz"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                className="input-modern"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Telefon *</label>
              <Input
                placeholder="0532 123 45 67"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                required
                className="input-modern"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Adres</label>
              <Input
                placeholder="Köy/Mahalle, İlçe"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="input-modern"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Hayvan Sayısı</label>
              <Input
                type="number"
                placeholder="0"
                value={form.totalAnimals || ''}
                onChange={e => setForm({ ...form, totalAnimals: parseInt(e.target.value) || 0 })}
                className="input-modern"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Borç (₺)</label>
              <Input
                type="number"
                placeholder="0"
                value={form.debt || ''}
                onChange={e => setForm({ ...form, debt: parseFloat(e.target.value) || 0 })}
                className="input-modern"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={cancelEdit} className="px-6">İptal</Button>
            <button type="submit" className="btn-primary">
              <Check className="w-4 h-4" />
              {editingId ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Müşteri ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-modern pl-11"
        />
      </div>

      {filteredClients.length === 0 ? (
        <div className="section-card text-center py-16">
          <div className="text-5xl mb-4 opacity-50">👥</div>
          <p className="text-muted-foreground font-medium">
            {search ? 'Arama sonucu bulunamadı' : 'Henüz müşteri eklenmemiş'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredClients.map((client, i) => (
            <div 
              key={client.id} 
              className="list-item group"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="icon-box">🐄</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground">{client.name}</h4>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    {client.phone}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    🐄 {client.totalAnimals} baş
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${client.debt > 0 ? 'text-destructive' : 'text-success'}`}>
                  {client.debt > 0 ? `₺${client.debt.toLocaleString('tr-TR')}` : 'Borç Yok'}
                </p>
                {client.debt > 0 && (
                  <span className="badge badge-danger text-[10px] mt-1">Borçlu</span>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(client)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(client.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientsPanel;
