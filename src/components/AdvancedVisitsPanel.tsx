import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useVisits } from "@/hooks/useVisits";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAnimals } from "@/hooks/useAnimals";
import { Visit, Client, Animal } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface VisitFormData {
  client_id: string;
  animal_id: string;
  visit_reason: string;
  clinical_complaint: string;
  examination_findings: string;
  diagnosis: string;
  treatment_plan: string;
  prognosis: string;
  total_cost: number;
  service_charge: number;
  medication_cost: number;
  follow_up_date: string;
}

export default function AdvancedVisitsPanel() {
  const { visits, loading, error, createVisit, updateVisit, deleteVisit } =
    useVisits();
  const { data: clients } = useSupabaseData<Client>("clients");
  const { animals } = useAnimals();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [formData, setFormData] = useState<VisitFormData>({
    client_id: "",
    animal_id: "",
    visit_reason: "Routine Check",
    clinical_complaint: "",
    examination_findings: "",
    diagnosis: "",
    treatment_plan: "",
    prognosis: "",
    total_cost: 0,
    service_charge: 0,
    medication_cost: 0,
    follow_up_date: "",
  });

  const clientAnimals = selectedClient
    ? animals.filter((a) => a.client_id === selectedClient)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_id || !formData.animal_id) {
      toast.error("Lütfen işletme ve hayvan seçin");
      return;
    }

    try {
      if (editingId) {
        await updateVisit(editingId, {
          ...formData,
        } as Partial<Visit>);
        toast.success("Ziyaret güncellendi");
      } else {
        await createVisit({
          ...formData,
          visit_date: new Date().toISOString(),
        } as Omit<Visit, "id" | "user_id" | "created_at" | "updated_at" | "status" | "notes">);
        toast.success("Ziyaret kaydedildi");
      }
      resetForm();
      setIsOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "İşlem başarısız oldu"
      );
    }
  };

  const handleEdit = (visit: Visit) => {
    const animal = animals.find((a) => a.id === visit.animal_id);
    setSelectedClient(visit.client_id);
    setFormData({
      client_id: visit.client_id,
      animal_id: visit.animal_id,
      visit_reason: visit.visit_reason as any,
      clinical_complaint: visit.clinical_complaint,
      examination_findings: visit.examination_findings,
      diagnosis: visit.diagnosis,
      treatment_plan: visit.treatment_plan,
      prognosis: visit.prognosis,
      total_cost: visit.total_cost,
      service_charge: visit.service_charge,
      medication_cost: visit.medication_cost,
      follow_up_date: visit.follow_up_date || "",
    });
    setEditingId(visit.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ziyareti silmek istediğinize emin misiniz?")) return;
    try {
      await deleteVisit(id);
      toast.success("Ziyaret silindi");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Silme işlemi başarısız"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: "",
      animal_id: "",
      visit_reason: "Routine Check",
      clinical_complaint: "",
      examination_findings: "",
      diagnosis: "",
      treatment_plan: "",
      prognosis: "",
      total_cost: 0,
      service_charge: 0,
      medication_cost: 0,
      follow_up_date: "",
    });
    setEditingId(null);
    setSelectedClient("");
  };

  const getAnimalInfo = (animalId: string) => {
    return animals.find((a) => a.id === animalId);
  };

  const getClientInfo = (clientId: string) => {
    return clients.find((c) => c.id === clientId);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Veteriner Ziyaretleri</CardTitle>
            <CardDescription>
              Detaylı muayene ve tanı kayıtlarını yönetin
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
                Ziyaret Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Ziyaret Düzenle" : "Yeni Ziyaret"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <label className="text-sm font-medium">İşletme *</label>
                    <Select
                      value={selectedClient}
                      onValueChange={(value) => {
                        setSelectedClient(value);
                        setFormData({ ...formData, client_id: value, animal_id: "" });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="İşletme seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Hayvan *</label>
                    <Select
                      value={formData.animal_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, animal_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Hayvan seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientAnimals.map((animal) => (
                          <SelectItem key={animal.id} value={animal.id}>
                            {animal.ear_tag_number} - {animal.name || animal.breed}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Ziyaret Nedeni</label>
                    <Select
                      value={formData.visit_reason}
                      onValueChange={(value) =>
                        setFormData({ ...formData, visit_reason: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Routine Check">Rutin Kontrol</SelectItem>
                        <SelectItem value="Sick Visit">Hasta Ziyareti</SelectItem>
                        <SelectItem value="Follow-up">Kontrol Ziyareti</SelectItem>
                        <SelectItem value="Vaccination">Aşılama</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3 border-b pb-4">
                  <div>
                    <label className="text-sm font-medium">
                      Klinik Şikâyet *
                    </label>
                    <Textarea
                      placeholder="Hayvanın nasıl şikayet ve bulguları..."
                      value={formData.clinical_complaint}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          clinical_complaint: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Muayene Bulguları *
                    </label>
                    <Textarea
                      placeholder="Detaylı muayene bulguları, vital bulgular..."
                      value={formData.examination_findings}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          examination_findings: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tanı *</label>
                    <Textarea
                      placeholder="Tanı koşulu ve ayırıcı tanı..."
                      value={formData.diagnosis}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          diagnosis: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tedavi Planı</label>
                    <Textarea
                      placeholder="Önerilen tedavi protokolü..."
                      value={formData.treatment_plan}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          treatment_plan: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Prognoz</label>
                    <Textarea
                      placeholder="Beklenen seyre ilişkin görüş..."
                      value={formData.prognosis}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          prognosis: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-b pb-4">
                  <div>
                    <label className="text-sm font-medium">Hizmet Ücreti</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.service_charge}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          service_charge: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      İlaç Maliyeti
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.medication_cost}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          medication_cost: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Toplam Tutar</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={
                        formData.service_charge + formData.medication_cost
                      }
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Takip Kontrol Tarihi
                  </label>
                  <Input
                    type="date"
                    value={formData.follow_up_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        follow_up_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingId ? "Güncelle" : "Kaydet"}
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

      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Yükleniyor...
          </div>
        ) : visits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Henüz ziyaret kaydı bulunmamaktadır
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((visit) => (
              <div
                key={visit.id}
                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(visit.visit_date), "d MMMM yyyy HH:mm", {
                          locale: tr,
                        })}
                      </span>
                    </div>
                    <h3 className="font-semibold">
                      {getClientInfo(visit.client_id)?.name} -{" "}
                      {getAnimalInfo(visit.animal_id)?.ear_tag_number}
                    </h3>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(visit)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(visit.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Şikâyet:</span>
                    <p className="font-medium">{visit.clinical_complaint}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tanı:</span>
                    <p className="font-medium">{visit.diagnosis}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Toplam Tutar:</span>
                    <p className="font-medium text-green-600">
                      ₺{visit.total_cost.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Durum:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        visit.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : visit.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {visit.status === "Completed"
                        ? "Tamamlandı"
                        : visit.status === "Pending"
                          ? "Beklemede"
                          : "Takip Gerekli"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
