import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, AlertTriangle, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMedications } from "@/hooks/useMedications";
import { Medication } from "@/types";
import { toast } from "sonner";

interface MedicationFormData {
  name: string;
  active_ingredient: string;
  concentration: string;
  manufacturer: string;
  unit_type: string;
  current_stock: number;
  reorder_level: number;
  max_stock: number;
  unit_price: number;
  supplier: string;
  expiry_date: string;
  batch_number: string;
  therapeutic_category: string;
  dosage_info: string;
  notes: string;
}

export default function AdvancedMedicationsPanel() {
  const {
    medications,
    loading,
    addMedication,
    updateMedication,
    deleteMedication,
    getLowStockMedications,
    getExpiredMedications,
  } = useMedications();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [formData, setFormData] = useState<MedicationFormData>({
    name: "",
    active_ingredient: "",
    concentration: "",
    manufacturer: "",
    unit_type: "ml",
    current_stock: 0,
    reorder_level: 10,
    max_stock: 100,
    unit_price: 0,
    supplier: "",
    expiry_date: "",
    batch_number: "",
    therapeutic_category: "",
    dosage_info: "",
    notes: "",
  });

  const lowStockMeds = getLowStockMedications();
  const expiredMeds = getExpiredMedications();

  const filteredMedications = medications.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.active_ingredient.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !filterCategory || med.therapeutic_category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(medications.map((m) => m.therapeutic_category))].filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.unit_type) {
      toast.error("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    try {
      if (editingId) {
        await updateMedication(editingId, {
          ...formData,
        } as Partial<Medication>);
        toast.success("İlaç güncellendi");
      } else {
        await addMedication(formData as Omit<Medication, "id" | "user_id" | "created_at" | "updated_at">);
        toast.success("İlaç eklendi");
      }
      resetForm();
      setIsOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "İşlem başarısız oldu"
      );
    }
  };

  const handleEdit = (medication: Medication) => {
    setFormData({
      name: medication.name,
      active_ingredient: medication.active_ingredient,
      concentration: medication.concentration,
      manufacturer: medication.manufacturer,
      unit_type: medication.unit_type,
      current_stock: medication.current_stock,
      reorder_level: medication.reorder_level,
      max_stock: medication.max_stock,
      unit_price: medication.unit_price,
      supplier: medication.supplier,
      expiry_date: medication.expiry_date || "",
      batch_number: medication.batch_number,
      therapeutic_category: medication.therapeutic_category,
      dosage_info: medication.dosage_info,
      notes: medication.notes,
    });
    setEditingId(medication.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ilacı silmek istediğinize emin misiniz?")) return;
    try {
      await deleteMedication(id);
      toast.success("İlaç silindi");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Silme işlemi başarısız"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      active_ingredient: "",
      concentration: "",
      manufacturer: "",
      unit_type: "ml",
      current_stock: 0,
      reorder_level: 10,
      max_stock: 100,
      unit_price: 0,
      supplier: "",
      expiry_date: "",
      batch_number: "",
      therapeutic_category: "",
      dosage_info: "",
      notes: "",
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>İlaç Yönetimi</CardTitle>
              <CardDescription>
                Stok takibi ve ilaç yönetimini profesyonelce yapın
              </CardDescription>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm();
                  }}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  İlaç Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "İlaç Düzenle" : "Yeni İlaç"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div>
                      <label className="text-sm font-medium">İlaç Adı *</label>
                      <Input
                        placeholder="İlaç ticari adı"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Aktif Madde
                      </label>
                      <Input
                        placeholder="örn: Amoksisilin"
                        value={formData.active_ingredient}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            active_ingredient: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Konsantrasyon</label>
                      <Input
                        placeholder="örn: 250mg/5ml"
                        value={formData.concentration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            concentration: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Üretici</label>
                      <Input
                        placeholder="Şirket adı"
                        value={formData.manufacturer}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            manufacturer: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Kategori
                      </label>
                      <Input
                        placeholder="örn: Antibiyotik"
                        value={formData.therapeutic_category}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            therapeutic_category: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Tedarikçi</label>
                      <Input
                        placeholder="Tedarikçi adı"
                        value={formData.supplier}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            supplier: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-b pb-4">
                    <div>
                      <label className="text-sm font-medium">Birim *</label>
                      <Select
                        value={formData.unit_type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, unit_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="tablet">tablet</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="vial">vial</SelectItem>
                          <SelectItem value="dose">dose</SelectItem>
                          <SelectItem value="bottle">şişe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Birim Fiyatı (₺)
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.unit_price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            unit_price: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Batch No</label>
                      <Input
                        placeholder="Batch numarası"
                        value={formData.batch_number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            batch_number: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 border-b pb-4">
                    <div>
                      <label className="text-sm font-medium">Mevcut Stok</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.current_stock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            current_stock: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Yeniden Sipariş Sınırı
                      </label>
                      <Input
                        type="number"
                        placeholder="10"
                        value={formData.reorder_level}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            reorder_level: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Maks. Stok</label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={formData.max_stock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            max_stock: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Son Kullanma Tarihi
                      </label>
                      <Input
                        type="date"
                        value={formData.expiry_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expiry_date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Doz Bilgisi</label>
                    <Input
                      placeholder="Önerilen doz schemaları"
                      value={formData.dosage_info}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dosage_info: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Notlar</label>
                    <Input
                      placeholder="Ek bilgiler"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          notes: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingId ? "Güncelle" : "Ekle"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                    >
                      İptal
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {lowStockMeds.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <strong>Stok Uyarısı:</strong> {lowStockMeds.length} ilaç yeniden
            sipariş seviyesinin altında:
            {lowStockMeds.map((m) => (
              <div key={m.id} className="ml-4 text-sm">
                • {m.name} ({m.current_stock} {m.unit_type})
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {expiredMeds.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong>Son Kullanma Tarihi Geçti:</strong> {expiredMeds.length}{" "}
            ilaç:
            {expiredMeds.map((m) => (
              <div key={m.id} className="ml-4 text-sm">
                • {m.name} ({m.expiry_date})
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="İlaç adı veya aktif madde ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tüm kategoriler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tüm kategoriler</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Yükleniyor...
            </div>
          ) : filteredMedications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {medications.length === 0
                ? "Henüz ilaç eklenmedi"
                : "Arama sonucu bulunamadı"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>İlaç Adı</TableHead>
                    <TableHead>Aktif Madde</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Mevcut Stok</TableHead>
                    <TableHead>Birim Fiyatı</TableHead>
                    <TableHead>Son Kullanma</TableHead>
                    <TableHead className="w-20">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedications.map((med) => {
                    const isLowStock = med.current_stock <= med.reorder_level;
                    const isExpired =
                      med.expiry_date &&
                      med.expiry_date <= new Date().toISOString().split("T")[0];

                    return (
                      <TableRow
                        key={med.id}
                        className={
                          isExpired ? "bg-red-50" : isLowStock ? "bg-yellow-50" : ""
                        }
                      >
                        <TableCell className="font-medium">{med.name}</TableCell>
                        <TableCell>{med.active_ingredient || "-"}</TableCell>
                        <TableCell>{med.therapeutic_category || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isLowStock && (
                              <TrendingDown className="h-4 w-4 text-yellow-600" />
                            )}
                            {med.current_stock} {med.unit_type}
                          </div>
                        </TableCell>
                        <TableCell>₺{med.unit_price.toFixed(2)}</TableCell>
                        <TableCell>
                          {med.expiry_date ? (
                            <span
                              className={
                                isExpired ? "text-red-600 font-medium" : ""
                              }
                            >
                              {med.expiry_date}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(med)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(med.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
