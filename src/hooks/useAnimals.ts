import { useCallback, useEffect, useState } from "react";
import { Animal } from "@/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";

export const useAnimals = (clientId?: string) => {
  const { user } = useAuth();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnimals = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("animals")
        .select("*")
        .eq("user_id", user.id);

      if (clientId) {
        query = query.eq("client_id", clientId);
      }

      const { data, error: err } = await query.order("created_at", {
        ascending: false,
      });

      if (err) throw err;
      setAnimals(data || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch animals";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user, clientId]);

  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  const addAnimal = useCallback(
    async (animalData: Omit<Animal, "id" | "user_id" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("User not authenticated");

      try {
        const { data, error: err } = await supabase
          .from("animals")
          .insert([{ ...animalData, user_id: user.id }])
          .select()
          .single();

        if (err) throw err;
        setAnimals((prev) => [data as Animal, ...prev]);
        return data as Animal;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to add animal";
        setError(message);
        throw err;
      }
    },
    [user]
  );

  const updateAnimal = useCallback(
    async (id: string, updates: Partial<Animal>) => {
      if (!user) throw new Error("User not authenticated");

      try {
        const { data, error: err } = await supabase
          .from("animals")
          .update(updates)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (err) throw err;
        setAnimals((prev) =>
          prev.map((animal) => (animal.id === id ? (data as Animal) : animal))
        );
        return data as Animal;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update animal";
        setError(message);
        throw err;
      }
    },
    [user]
  );

  const deleteAnimal = useCallback(
    async (id: string) => {
      if (!user) throw new Error("User not authenticated");

      try {
        const { error: err } = await supabase
          .from("animals")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (err) throw err;
        setAnimals((prev) => prev.filter((animal) => animal.id !== id));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete animal";
        setError(message);
        throw err;
      }
    },
    [user]
  );

  return {
    animals,
    loading,
    error,
    fetchAnimals,
    addAnimal,
    updateAnimal,
    deleteAnimal,
  };
};
