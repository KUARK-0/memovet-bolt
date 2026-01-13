import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";
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
import { useAnimals } from "@/hooks/useAnimals";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Animal, Client } from "@/types";
import { toast } from "sonner";

interface AnimalFormData {
  ear_tag_number: string;
  name: string;
  breed: string;
  birth_date: string;
  sex: "Male" | "Female";
  color_marking: string;
  weight_kg: number;
  health_status: "Healthy" | "Under Treatment" | "Quarantine";
  notes: string;
}

export default function AnimalsPanel() {
  const { animals, loading, error, fetchAnimals, addAnimal, updateAnimal, deleteAnimal } =
    useAnimals();
  const { data: clients } = useSupabaseData<Client>("clients");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<AnimalFormData>({
    ear_tag_number: "",
    name: "",
    breed: "",
    birth_date: "",
    sex: "Male",
    color_marking: "",
    weight_kg: 0,
    health_status: "Healthy",
    notes: "",
  });

  const clientAnimals = selectedClient
    ? animals.filter((a) => a.client_id === selectedClient)
    : animals;

  const filteredAnimals = clientAnimals.filter(
    (animal) =>
      animal.ear_tag_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ear_tag_number || !formData.breed || !formData.birth_date) {
      toast.error("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    if (!selectedClient) {
      toast.error("Lütfen işletme seçin");
      return;
    }

    try {
      if (editingId) {
        await updateAnimal(editingId, {
          ...formData,
        } as Partial<Animal>);
        toast.success("Hayvan güncellendi");
      } else {
        await addAnimal({
          client_id: selectedClient,
          ...formData,
        } as Omit<Animal, "id" | "user_id" | "created_at" | "updated_at">);
        toast.success("Hayvan eklendi");
      }
      resetForm();
      setIsOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "İşlem başarısız oldu"
      );
    }
  };

  const handleEdit = (animal: Animal) => {
    setFormData({
      ear_tag_number: animal.ear_tag_number,
      name: animal.name,
      breed: animal.breed,
      birth_date: animal.birth_date,
      sex: animal.sex,
      color_marking: animal.color_marking,
      weight_kg: animal.weight_kg,
      health_status: animal.health_status,
      notes: animal.notes,
    });
    setSelectedClient(animal.client_id);
    setEditingId(animal.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu hayvanı silmek istediğinize emin misiniz?")) return;
    try {
      await deleteAnimal(id);
      toast.success("Hayvan silindi");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Silme işlemi başarısız"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      ear_tag_number: "",
      name: "",
      breed: "",
      birth_date: "",
      sex: "Male",
      color_marking: "",
      weight_kg: 0,
      health_status: "Healthy",
      notes: "",
    });
    setEditingId(null);
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Hayvan Yönetimi</CardTitle>
            <CardDescription>
              İşletmenizdeki hayvanları yönetin ve takip edin
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
                Hayvan Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Hayvan Düzenle" : "Yeni Hayvan"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      İşletme *
                    </label>
                    <Select
                      value={selectedClient}
                      onValueChange={setSelectedClient}
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
                    <label className="text-sm font-medium">
                      Küpe Numarası *
                    </label>
                    <Input
                      placeholder="örn: 001-23456"
                      value={formData.ear_tag_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ear_tag_number: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Adı</label>
                    <Input
                      placeholder="Hayvan adı (isteğe bağlı)"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Cins *</label>
                    <Input
                      placeholder="örn: Holstein, Simmental"
                      value={formData.breed}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          breed: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Doğum Tarihi *</label>
                    <Input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          birth_date: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Cinsiyet</label>
                    <Select
                      value={formData.sex}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          sex: value as "Male" | "Female",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Erkek</SelectItem>
                        <SelectItem value="Female">Dişi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Renk/İşaret</label>
                    <Input
                      placeholder="Renk veya ayırt edici işaret"
                      value={formData.color_marking}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          color_marking: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Ağırlık (kg)
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.weight_kg}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          weight_kg: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Sağlık Durumu</label>
                    <Select
                      value={formData.health_status}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          health_status: value as any,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Healthy">Sağlıklı</SelectItem>
                        <SelectItem value="Under Treatment">
                          Tedavi Altında
                        </SelectItem>
                        <SelectItem value="Quarantine">Karantina</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Notlar</label>
                  <Input
                    placeholder="Hayvan hakkında ek bilgiler"
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

      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Küpe, ad veya cins ile ara..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tüm işletmeler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tüm işletmeler</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Yükleniyor...
          </div>
        ) : filteredAnimals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {animals.length === 0
              ? "Henüz hayvan eklenmedi"
              : "Arama sonucu bulunamadı"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Küpe Numarası</TableHead>
                  <TableHead>Adı</TableHead>
                  <TableHead>Cins</TableHead>
                  <TableHead>Cinsiyet</TableHead>
                  <TableHead>Ağırlık</TableHead>
                  <TableHead>Sağlık Durumu</TableHead>
                  <TableHead className="w-24">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnimals.map((animal) => (
                  <TableRow key={animal.id}>
                    <TableCell className="font-medium">
                      {animal.ear_tag_number}
                    </TableCell>
                    <TableCell>{animal.name || "-"}</TableCell>
                    <TableCell>{animal.breed}</TableCell>
                    <TableCell>
                      {animal.sex === "Male" ? "Erkek" : "Dişi"}
                    </TableCell>
                    <TableCell>{animal.weight_kg} kg</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${
                          animal.health_status === "Healthy"
                            ? "bg-green-100 text-green-800"
                            : animal.health_status === "Under Treatment"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {animal.health_status === "Healthy"
                          ? "Sağlıklı"
                          : animal.health_status === "Under Treatment"
                            ? "Tedavi Altında"
                            : "Karantina"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(animal)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(animal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
