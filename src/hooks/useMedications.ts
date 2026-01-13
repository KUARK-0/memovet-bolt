import { useCallback, useEffect, useState } from "react";
import { Medication, MedicationUsageHistory } from "@/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";

export const useMedications = () => {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [usageHistory, setUsageHistory] = useState<MedicationUsageHistory[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (err) throw err;
      setMedications(data || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch medications";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const addMedication = useCallback(
    async (
      medData: Omit<
        Medication,
        "id" | "user_id" | "created_at" | "updated_at"
      >
    ) => {
      if (!user) throw new Error("User not authenticated");

      try {
        const { data, error: err } = await supabase
          .from("medications")
          .insert([{ ...medData, user_id: user.id }])
          .select()
          .single();

        if (err) throw err;
        setMedications((prev) => [...prev, data as Medication].sort((a, b) =>
          a.name.localeCompare(b.name)
        ));
        return data as Medication;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to add medication";
        setError(message);
        throw err;
      }
    },
    [user]
  );

  const updateMedication = useCallback(
    async (id: string, updates: Partial<Medication>) => {
      if (!user) throw new Error("User not authenticated");

      try {
        const { data, error: err } = await supabase
          .from("medications")
          .update(updates)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (err) throw err;
        setMedications((prev) =>
          prev.map((med) => (med.id === id ? (data as Medication) : med))
        );
        return data as Medication;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update medication";
        setError(message);
        throw err;
      }
    },
    [user]
  );

  const deleteMedication = useCallback(
    async (id: string) => {
      if (!user) throw new Error("User not authenticated");

      try {
        const { error: err } = await supabase
          .from("medications")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (err) throw err;
        setMedications((prev) => prev.filter((med) => med.id !== id));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete medication";
        setError(message);
        throw err;
      }
    },
    [user]
  );

  const recordUsage = useCallback(
    async (
      usageData: Omit<
        MedicationUsageHistory,
        "id" | "user_id" | "created_at"
      >
    ) => {
      if (!user) throw new Error("User not authenticated");

      try {
        const { data: history, error: histErr } = await supabase
          .from("medication_usage_history")
          .insert([{ ...usageData, user_id: user.id }])
          .select()
          .single();

        if (histErr) throw histErr;

        const medId = usageData.medication_id;
        const { data: med, error: medErr } = await supabase
          .from("medications")
          .select("current_stock")
          .eq("id", medId)
          .single();

        if (medErr) throw medErr;

        const newStock = med.current_stock - usageData.quantity_used;
        await updateMedication(medId, {
          current_stock: Math.max(0, newStock),
        } as Partial<Medication>);

        setUsageHistory((prev) => [
          history as MedicationUsageHistory,
          ...prev,
        ]);
        return history as MedicationUsageHistory;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to record medication usage";
        setError(message);
        throw err;
      }
    },
    [user, updateMedication]
  );

  const getLowStockMedications = useCallback(() => {
    return medications.filter((med) => med.current_stock <= med.reorder_level);
  }, [medications]);

  const getExpiredMedications = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    return medications.filter(
      (med) => med.expiry_date && med.expiry_date <= today
    );
  }, [medications]);

  return {
    medications,
    usageHistory,
    loading,
    error,
    fetchMedications,
    addMedication,
    updateMedication,
    deleteMedication,
    recordUsage,
    getLowStockMedications,
    getExpiredMedications,
  };
};
