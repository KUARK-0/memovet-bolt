import { useCallback, useEffect, useState } from "react";
import { IncomeRecord, PaymentTransaction, Expense } from "@/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";

export const useFinancial = (dateRange?: {
  startDate?: string;
  endDate?: string;
}) => {
  const { user } = useAuth();
  const [income, setIncome] = useState<IncomeRecord[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let incomeQuery = supabase
        .from("income_records")
        .select("*")
        .eq("user_id", user.id);

      if (dateRange?.startDate) {
        incomeQuery = incomeQuery.gte("income_date", dateRange.startDate);
      }
      if (dateRange?.endDate) {
        incomeQuery = incomeQuery.lte("income_date", dateRange.endDate);
      }

      const { data: incomeData, error: incomeErr } = await incomeQuery.order(
        "income_date",
        { ascending: false }
      );
      if (incomeErr) throw incomeErr;

      let expenseQuery = supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id);

      if (dateRange?.startDate) {
        expenseQuery = expenseQuery.gte("expense_date", dateRange.startDate);
      }
      if (dateRange?.endDate) {
        expenseQuery = expenseQuery.lte("expense_date", dateRange.endDate);
      }

      const { data: expenseData, error: expenseErr } = await expenseQuery.order(
        "expense_date",
        { ascending: false }
      );
      if (expenseErr) throw expenseErr;

      const { data: paymentData, error: paymentErr } = await supabase
        .from("payment_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("payment_date", { ascending: false });

      if (paymentErr) throw paymentErr;

      setIncome(incomeData || []);
      setExpenses(expenseData || []);
      setPayments(paymentData || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch financial data";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user, dateRange?.startDate, dateRange?.endDate]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const addIncomeRecord = useCallback(
    async (
      incomeData: Omit<
        IncomeRecord,
        "id" | "user_id" | "created_at" | "updated_at"
      >
    ) => {
      if (!user) throw new Error("User not authenticated");

      try {
        const { data, error: err } = await supabase
          .from("income_records")
          .insert([{ ...incomeData, user_id: user.id }])
          .select()
          .single();

        if (err) throw err;
        setIncome((prev) => [data as IncomeRecord, ...prev]);
        return data as IncomeRecord;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to add income record";
        setError(message);
        throw err;
      }
    },
    [user]
  );

  const addPaymentTransaction = useCallback(
    async (
      paymentData: Omit<
        PaymentTransaction,
        "id" | "user_id" | "created_at"
      >
    ) => {
      if (!user) throw new Error("User not authenticated");

      try {
        const { data, error: err } = await supabase
          .from("payment_transactions")
          .insert([{ ...paymentData, user_id: user.id }])
          .select()
          .single();

        if (err) throw err;

        const totalPaid = payments
          .filter((p) => p.income_record_id === paymentData.income_record_id)
          .reduce((sum, p) => sum + p.amount_paid, 0);

        const incomeRecord = income.find(
          (i) => i.id === paymentData.income_record_id
        );
        if (incomeRecord) {
          const newTotal = totalPaid + paymentData.amount_paid;
          const status =
            newTotal >= incomeRecord.amount
              ? "Paid"
              : newTotal > 0
                ? "Partial"
                : "Pending";

          await updateIncomeRecord(paymentData.income_record_id, {
            payment_status: status,
          } as Partial<IncomeRecord>);
        }

        setPayments((prev) => [data as PaymentTransaction, ...prev]);
        return data as PaymentTransaction;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to add payment transaction";
        setError(message);
        throw err;
      }
    },
    [user, payments, income]
  );

  const addExpense = useCallback(
    async (
      expenseData: Omit<Expense, "id" | "user_id" | "created_at">
    ) => {
      if (!user) throw new Error("User not authenticated");

      try {
        const { data, error: err } = await supabase
          .from("expenses")
          .insert([{ ...expenseData, user_id: user.id }])
          .select()
          .single();

        if (err) throw err;
        setExpenses((prev) => [data as Expense, ...prev]);
        return data as Expense;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to add expense";
        setError(message);
        throw err;
      }
    },
    [user]
  );

  const updateIncomeRecord = useCallback(
    async (id: string, updates: Partial<IncomeRecord>) => {
      if (!user) throw new Error("User not authenticated");

      try {
        const { data, error: err } = await supabase
          .from("income_records")
          .update(updates)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (err) throw err;
        setIncome((prev) =>
          prev.map((record) =>
            record.id === id ? (data as IncomeRecord) : record
          )
        );
        return data as IncomeRecord;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update income record";
        setError(message);
        throw err;
      }
    },
    [user]
  );

  const getTotalIncome = useCallback(() => {
    return income.reduce((sum, rec) => sum + rec.amount, 0);
  }, [income]);

  const getTotalExpenses = useCallback(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  const getTotalDebtOutstanding = useCallback(() => {
    return income
      .filter((rec) => rec.payment_status !== "Paid")
      .reduce((sum, rec) => {
        const paidAmount = payments
          .filter((p) => p.income_record_id === rec.id)
          .reduce((sum, p) => sum + p.amount_paid, 0);
        return sum + (rec.amount - paidAmount);
      }, 0);
  }, [income, payments]);

  const getExpensesByCategory = useCallback(() => {
    const categories: Record<string, number> = {};
    expenses.forEach((exp) => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });
    return categories;
  }, [expenses]);

  return {
    income,
    payments,
    expenses,
    loading,
    error,
    fetchFinancialData,
    addIncomeRecord,
    addPaymentTransaction,
    addExpense,
    updateIncomeRecord,
    getTotalIncome,
    getTotalExpenses,
    getTotalDebtOutstanding,
    getExpensesByCategory,
  };
};
