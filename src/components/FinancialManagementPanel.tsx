import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, DollarSign, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinancial } from "@/hooks/useFinancial";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { IncomeRecord, PaymentTransaction, Expense, Client } from "@/types";
import { toast } from "sonner";

interface IncomeFormData {
  client_id: string;
  service_description: string;
  amount: number;
  income_date: string;
  notes: string;
}

interface PaymentFormData {
  income_record_id: string;
  amount_paid: number;
  payment_method: string;
  payment_date: string;
  check_number: string;
  check_due_date: string;
}

interface ExpenseFormData {
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  supplier: string;
  payment_method: string;
  invoice_number: string;
}

export default function FinancialManagementPanel() {
  const {
    income,
    payments,
    expenses,
    loading,
    addIncomeRecord,
    addPaymentTransaction,
    addExpense,
    getTotalIncome,
    getTotalExpenses,
    getTotalDebtOutstanding,
    getExpensesByCategory,
  } = useFinancial();

  const { data: clients } = useSupabaseData<Client>("clients");

  const [activeTab, setActiveTab] = useState("income");
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  const [incomeForm, setIncomeForm] = useState<IncomeFormData>({
    client_id: "",
    service_description: "",
    amount: 0,
    income_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    income_record_id: "",
    amount_paid: 0,
    payment_method: "Cash",
    payment_date: new Date().toISOString().split("T")[0],
    check_number: "",
    check_due_date: "",
  });

  const [expenseForm, setExpenseForm] = useState<ExpenseFormData>({
    category: "Medications",
    description: "",
    amount: 0,
    expense_date: new Date().toISOString().split("T")[0],
    supplier: "",
    payment_method: "Cash",
    invoice_number: "",
  });

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const outstandingDebt = getTotalDebtOutstanding();
  const profit = totalIncome - totalExpenses;

  const pendingIncomeRecords = income.filter((rec) => rec.payment_status !== "Paid");

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeForm.client_id) {
      toast.error("Lütfen işletme seçin");
      return;
    }

    try {
      await addIncomeRecord({
        ...incomeForm,
        visit_id: null,
        currency: "TRY",
        payment_status: "Pending",
      } as Omit<IncomeRecord, "id" | "user_id" | "created_at" | "updated_at">);
      toast.success("Gelir kaydedildi");
      setIncomeForm({
        client_id: "",
        service_description: "",
        amount: 0,
        income_date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setIsIncomeDialogOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "İşlem başarısız oldu"
      );
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.income_record_id) {
      toast.error("Lütfen gelir kaydı seçin");
      return;
    }

    try {
      const incomeRecord = income.find(
        (i) => i.id === paymentForm.income_record_id
      );
      if (!incomeRecord) throw new Error("Gelir kaydı bulunamadı");

      await addPaymentTransaction({
        ...paymentForm,
        client_id: incomeRecord.client_id,
      } as Omit<PaymentTransaction, "id" | "user_id" | "created_at">);
      toast.success("Ödeme kaydedildi");
      setPaymentForm({
        income_record_id: "",
        amount_paid: 0,
        payment_method: "Cash",
        payment_date: new Date().toISOString().split("T")[0],
        check_number: "",
        check_due_date: "",
      });
      setIsPaymentDialogOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "İşlem başarısız oldu"
      );
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addExpense({
        ...expenseForm,
        currency: "TRY",
      } as Omit<Expense, "id" | "user_id" | "created_at">);
      toast.success("Gider kaydedildi");
      setExpenseForm({
        category: "Medications",
        description: "",
        amount: 0,
        expense_date: new Date().toISOString().split("T")[0],
        supplier: "",
        payment_method: "Cash",
        invoice_number: "",
      });
      setIsExpenseDialogOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "İşlem başarısız oldu"
      );
    }
  };

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || "Bilinmeyen";
  };

  const expensesByCategory = getExpensesByCategory();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Gelir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₺{totalIncome.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Gider
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₺{totalExpenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Kar/Zarar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                profit >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ₺{profit.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ödenmemiş Borç
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₺{outstandingDebt.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Mali İşlemler</CardTitle>
          <CardDescription>Gelir, gider ve ödemeleri yönetin</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="income">Gelir</TabsTrigger>
              <TabsTrigger value="expenses">Gider</TabsTrigger>
              <TabsTrigger value="payments">Ödemeler</TabsTrigger>
            </TabsList>

            <TabsContent value="income" className="space-y-4 mt-4">
              <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Gelir Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni Gelir Kaydı</DialogTitle>
                    <DialogDescription>
                      Yeni bir gelir kaydını sisteme ekleyin
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddIncome} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">İşletme *</label>
                      <Select
                        value={incomeForm.client_id}
                        onValueChange={(value) =>
                          setIncomeForm({ ...incomeForm, client_id: value })
                        }
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
                        Hizmet Açıklaması
                      </label>
                      <Input
                        placeholder="örn: Veteriner muayene ücreti"
                        value={incomeForm.service_description}
                        onChange={(e) =>
                          setIncomeForm({
                            ...incomeForm,
                            service_description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Tutar (₺) *</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={incomeForm.amount}
                        onChange={(e) =>
                          setIncomeForm({
                            ...incomeForm,
                            amount: parseFloat(e.target.value) || 0,
                          })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Tarih</label>
                      <Input
                        type="date"
                        value={incomeForm.income_date}
                        onChange={(e) =>
                          setIncomeForm({
                            ...incomeForm,
                            income_date: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Notlar</label>
                      <Input
                        placeholder="Ek bilgiler"
                        value={incomeForm.notes}
                        onChange={(e) =>
                          setIncomeForm({
                            ...incomeForm,
                            notes: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        Ekle
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsIncomeDialogOpen(false)}
                      >
                        İptal
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>İşletme</TableHead>
                      <TableHead>Hizmet</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Durum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {income.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{getClientName(record.client_id)}</TableCell>
                        <TableCell>{record.service_description}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          ₺{record.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>{record.income_date}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              record.payment_status === "Paid"
                                ? "bg-green-100 text-green-800"
                                : record.payment_status === "Partial"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {record.payment_status === "Paid"
                              ? "Ödendi"
                              : record.payment_status === "Partial"
                                ? "Kısmi Ödendi"
                                : "Ödenmedi"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4 mt-4">
              <Dialog
                open={isExpenseDialogOpen}
                onOpenChange={setIsExpenseDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Gider Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni Gider Kaydı</DialogTitle>
                    <DialogDescription>
                      Yeni bir gider kaydını sisteme ekleyin
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddExpense} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Kategori *</label>
                      <Select
                        value={expenseForm.category}
                        onValueChange={(value) =>
                          setExpenseForm({ ...expenseForm, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Medications">İlaçlar</SelectItem>
                          <SelectItem value="Equipment">Ekipman</SelectItem>
                          <SelectItem value="Supplies">Malzeme</SelectItem>
                          <SelectItem value="Utilities">Kamu Hizmeti</SelectItem>
                          <SelectItem value="Salary">Maaş</SelectItem>
                          <SelectItem value="Rent">Kira</SelectItem>
                          <SelectItem value="Other">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Açıklama</label>
                      <Input
                        placeholder="Gider açıklaması"
                        value={expenseForm.description}
                        onChange={(e) =>
                          setExpenseForm({
                            ...expenseForm,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Tutar (₺) *</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={expenseForm.amount}
                        onChange={(e) =>
                          setExpenseForm({
                            ...expenseForm,
                            amount: parseFloat(e.target.value) || 0,
                          })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Tarih</label>
                      <Input
                        type="date"
                        value={expenseForm.expense_date}
                        onChange={(e) =>
                          setExpenseForm({
                            ...expenseForm,
                            expense_date: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Tedarikçi</label>
                      <Input
                        placeholder="Tedarikçi adı"
                        value={expenseForm.supplier}
                        onChange={(e) =>
                          setExpenseForm({
                            ...expenseForm,
                            supplier: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        Ekle
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsExpenseDialogOpen(false)}
                      >
                        İptal
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {Object.entries(expensesByCategory).map(([category, amount]) => (
                  <Card key={category} className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">
                        ₺{(amount as number).toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Tedarikçi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">
                          {expense.category}
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell className="text-red-600 font-medium">
                          ₺{expense.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>{expense.expense_date}</TableCell>
                        <TableCell>{expense.supplier || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4 mt-4">
              <Dialog
                open={isPaymentDialogOpen}
                onOpenChange={setIsPaymentDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ödeme Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni Ödeme Kaydı</DialogTitle>
                    <DialogDescription>
                      Beklemede olan ödemeyi kaydedin
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddPayment} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        Ödenmesi Gereken Fatura *
                      </label>
                      <Select
                        value={paymentForm.income_record_id}
                        onValueChange={(value) =>
                          setPaymentForm({
                            ...paymentForm,
                            income_record_id: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Fatura seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {pendingIncomeRecords.map((record) => (
                            <SelectItem key={record.id} value={record.id}>
                              {getClientName(record.client_id)} - ₺
                              {record.amount.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Ödenen Tutar (₺) *
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={paymentForm.amount_paid}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            amount_paid: parseFloat(e.target.value) || 0,
                          })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Ödeme Yöntemi
                      </label>
                      <Select
                        value={paymentForm.payment_method}
                        onValueChange={(value) =>
                          setPaymentForm({
                            ...paymentForm,
                            payment_method: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Nakit</SelectItem>
                          <SelectItem value="Check">Çek</SelectItem>
                          <SelectItem value="Bank Transfer">Banka Transferi</SelectItem>
                          <SelectItem value="Credit Card">Kredi Kartı</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Tarih</label>
                      <Input
                        type="date"
                        value={paymentForm.payment_date}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            payment_date: e.target.value,
                          })
                        }
                      />
                    </div>

                    {paymentForm.payment_method === "Check" && (
                      <>
                        <div>
                          <label className="text-sm font-medium">Çek Numarası</label>
                          <Input
                            placeholder="Çek numarası"
                            value={paymentForm.check_number}
                            onChange={(e) =>
                              setPaymentForm({
                                ...paymentForm,
                                check_number: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Çek Vadesi
                          </label>
                          <Input
                            type="date"
                            value={paymentForm.check_due_date}
                            onChange={(e) =>
                              setPaymentForm({
                                ...paymentForm,
                                check_due_date: e.target.value,
                              })
                            }
                          />
                        </div>
                      </>
                    )}

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        Ekle
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsPaymentDialogOpen(false)}
                      >
                        İptal
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>İşletme</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Ödeme Yöntemi</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Referans</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {getClientName(payment.client_id)}
                        </TableCell>
                        <TableCell className="font-medium">
                          ₺{payment.amount_paid.toFixed(2)}
                        </TableCell>
                        <TableCell>{payment.payment_method}</TableCell>
                        <TableCell>{payment.payment_date}</TableCell>
                        <TableCell>
                          {payment.check_number ||
                            payment.transaction_reference ||
                            "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
