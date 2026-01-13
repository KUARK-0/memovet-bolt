import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";

export const useSupabaseData = <T,>(tableName: string) => {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (filters?: Record<string, unknown>) => {
      if (!user) {
        setError("User not authenticated");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let query = supabase.from(tableName).select("*");

        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        } else {
          query = query.eq("user_id", user.id);
        }

        const { data: result, error: err } = await query;

        if (err) throw err;
        setData(result || []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch data";
        setError(message);
        console.error(message);
      } finally {
        setLoading(false);
      }
    },
    [user, tableName]
  );

  const createRecord = useCallback(
    async (record: Omit<T, "id" | "created_at">) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
        const { data: result, error: err } = await supabase
          .from(tableName)
          .insert([{ ...record, user_id: user.id }])
          .select()
          .single();

        if (err) throw err;
        setData((prev) => [...prev, result as T]);
        return result as T;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create record";
        console.error(message);
        throw err;
      }
    },
    [user, tableName]
  );

  const updateRecord = useCallback(
    async (id: string, updates: Partial<T>) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
        const { data: result, error: err } = await supabase
          .from(tableName)
          .update(updates)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (err) throw err;
        setData((prev) =>
          prev.map((item: any) => (item.id === id ? (result as T) : item))
        );
        return result as T;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update record";
        console.error(message);
        throw err;
      }
    },
    [user, tableName]
  );

  const deleteRecord = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
        const { error: err } = await supabase
          .from(tableName)
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (err) throw err;
        setData((prev) => prev.filter((item: any) => item.id !== id));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete record";
        console.error(message);
        throw err;
      }
    },
    [user, tableName]
  );

  return {
    data,
    loading,
    error,
    fetchData,
    createRecord,
    updateRecord,
    deleteRecord,
  };
};
