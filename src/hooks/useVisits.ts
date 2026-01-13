import { useCallback, useEffect, useState } from "react";
import { Visit, VisitMedication, VitalSigns } from "@/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";

export const useVisits = (filters?: {
  clientId?: string;
  animalId?: string;
}) => {
  const { user } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [visitMeds, setVisitMeds] = useState<VisitMedication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVisits = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("visits")
        .select("*")
        .eq("user_id", user.id);

      if (filters?.clientId) {
        query = query.eq("client_id", filters.clientId);
      }
      if (filters?.animalId) {
        query = query.eq("animal_id", filters.animalId);
      }

      const { data, error: err } = await query.order("visit_date", {
        ascending: false,
      });

      if (err) throw err;
      setVisits(data || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch visits";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user, filters?.clientId, filters?.animalId]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const createVisit = useCallback(
    async (
      visitData: Omit<
        Visit,
        "id" | "user_id" | "created_at" | "updated_at"
      >,
      medicationsUsed?: Omit<
        VisitMedication,
        "id" | "user_id" | "visit_id" | "created_at"
      >[]
    ) => {
      if (!user) throw new Error("User not authenticated");

      try {
        const { data: newVisit, error: visitErr } = await supabase
          .from("visits")
          .insert([{ ...visitData, user_id: user.id }])
          .select()
          .single();

        if (visitErr) throw visitErr;

        if (medicationsUsed && medicationsUsed.length > 0) {
          const medsWithVisitId = medicationsUsed.map((med) => ({
            ...med,
            visit_id: newVisit.id,
            user_id: user.id,
          }));

          const { error: medsErr } = await supabase
            .from("visit_medications")
            .insert(medsWithVisitId);

          if (medsErr) throw medsErr;

          const { data: savedMeds } = await supabase
            .from("visit_medications")
            .select("*")
            .eq("visit_id", newVisit.id);

          setVisitMeds((prev) => [...(savedMeds || []), ...prev]);
        }

        setVisits((prev) => [newVisit as Visit, ...prev]);
        return newVisit as Visit;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create visit";
        setError(message);
        throw err;
      }
    },
    [user]
  );

  const updateVisit = useCallback(
    async (id: string, updates: Partial<Visit>) => {
      if (!user) throw new Error("User not authenticated");

      try {
        const { data, error: err } = await supabase
          .from("visits")
          .update(updates)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (err) throw err;
        setVisits((prev) =>
          prev.map((visit) => (visit.id === id ? (data as Visit) : visit))
        );
        return data as Visit;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update visit";
        setError(message);
        throw err;
      }
    },
    [user]
  );

  const deleteVisit = useCallback(
    async (id: string) => {
      if (!user) throw new Error("User not authenticated");

      try {
        const { error: err } = await supabase
          .from("visits")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (err) throw err;
        setVisits((prev) => prev.filter((visit) => visit.id !== id));
        setVisitMeds((prev) => prev.filter((med) => med.visit_id !== id));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete visit";
        setError(message);
        throw err;
      }
    },
    [user]
  );

  const recordVitalSigns = useCallback(
    async (
      animalId: string,
      vitals: Omit<VitalSigns, "id" | "user_id" | "created_at">
    ) => {
      if (!user) throw new Error("User not authenticated");

      try {
        const { data, error: err } = await supabase
          .from("vital_signs")
          .insert([{ ...vitals, user_id: user.id, animal_id: animalId }])
          .select()
          .single();

        if (err) throw err;
        return data as VitalSigns;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to record vital signs";
        setError(message);
        throw err;
      }
    },
    [user]
  );

  return {
    visits,
    visitMeds,
    loading,
    error,
    fetchVisits,
    createVisit,
    updateVisit,
    deleteVisit,
    recordVitalSigns,
  };
};
