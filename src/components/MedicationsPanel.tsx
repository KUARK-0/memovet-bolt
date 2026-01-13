import { useState } from 'react';
import { Medication } from '../types';
import { Plus, Trash2, Edit2, X, Check, Search, AlertTriangle } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface MedicationsPanelProps {
  medications: Medication[];
  onAdd: (medication: Omit<Medication, 'id'>) => void;
  onUpdate: (id: string, medication: Partial<Medication>) => void;
  onDelete: (id: string) => void;
}

const MedicationsPanel = ({ medications, onAdd, onUpdate, onDelete }: MedicationsPanelProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '',
    stock: 0,
    criticalLimit: 5,
    unit: 'adet'
  });

  const filteredMedications = medications.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(editingId, form);
      setEditingId(null);
    } else {
      onAdd(form);
    }
    setForm({ name: '', stock: 0, criticalLimit: 5, unit: 'adet' });
    setShowForm(false);
  };

  const startEdit = (medication: Medication) => {
    setEditingId(medication.id);
    setForm({
      name: medication.name,
      stock: medication.stock,
      criticalLimit: medication.criticalLimit,
      unit: medication.unit
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', stock: 0, criticalLimit: 5, unit: 'adet' });
    setShowForm(false);
  };

  const lowStockCount = medications.filter(m => m.stock <= m.criticalLimit).length;

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">İlaç Stoku</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {medications.length} kayıtlı ilaç
            {lowStockCount > 0 && (
              <span className="text-destructive ml-2">• {lowStockCount} kritik seviyede</span>
            )}
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Yeni İlaç
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="glass-card rounded-2xl p-4 border-destructive/20 bg-destructive/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{lowStockCount} ilaç kritik seviyede</p>
            <p className="text-xs text-muted-foreground">Stok takviyesi yapmanız önerilir</p>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="section-card space-y-5 animate-in">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-foreground text-lg">
              {editingId ? 'İlaç Düzenle' : 'Yeni İlaç'}
            </h3>
            <button type="button" onClick={cancelEdit} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">İlaç Adı *</label>
              <Input
                placeholder="Örn: Penisilin"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                className="input-modern"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Stok Miktarı</label>
              <Input
                type="number"
                placeholder="0"
                value={form.stock || ''}
                onChange={e => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                className="input-modern"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Kritik Limit</label>
              <Input
                type="number"
                placeholder="5"
                value={form.criticalLimit || ''}
                onChange={e => setForm({ ...form, criticalLimit: parseInt(e.target.value) || 0 })}
                className="input-modern"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Birim</label>
              <Input
                placeholder="adet, ml, gr..."
                value={form.unit}
                onChange={e => setForm({ ...form, unit: e.target.value })}
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
          placeholder="İlaç ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-modern pl-11"
        />
      </div>

      {filteredMedications.length === 0 ? (
        <div className="section-card text-center py-16">
          <div className="text-5xl mb-4 opacity-50">💊</div>
          <p className="text-muted-foreground font-medium">
            {search ? 'Arama sonucu bulunamadı' : 'Henüz ilaç eklenmemiş'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredMedications.map((medication, i) => {
            const isLow = medication.stock <= medication.criticalLimit;
            const stockPercentage = Math.min((medication.stock / (medication.criticalLimit * 3)) * 100, 100);
            
            return (
              <div 
                key={medication.id} 
                className={`list-item group ${isLow ? 'border-destructive/30 bg-destructive/5' : ''}`}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className={`icon-box ${isLow ? 'bg-destructive/10' : ''}`}>
                  💊
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{medication.name}</h4>
                    {isLow && <span className="badge badge-danger">Kritik</span>}
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Stok durumu</span>
                      <span>{medication.stock} / {medication.criticalLimit * 3} {medication.unit}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLow ? 'bg-destructive' : 'bg-primary'
                        }`}
                        style={{ width: `${stockPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${isLow ? 'text-destructive' : 'text-foreground'}`}>
                    {medication.stock}
                  </p>
                  <p className="text-xs text-muted-foreground">{medication.unit}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(medication)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(medication.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MedicationsPanel;
