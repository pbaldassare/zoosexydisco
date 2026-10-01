import { adminClient } from "@/lib/supabase";

/** Lettura, scrittura e ordinamento delle tabelle semplici del pannello (recensioni, ruoli, promozioni). */
const db = () => adminClient!;

export async function listRows<T>(table: string, order: { column: string; ascending?: boolean }[]): Promise<T[]> {
  let q = db().from(table).select("*");
  for (const o of order) q = q.order(o.column, { ascending: o.ascending ?? true });
  const { data, error } = await q;
  if (error) throw error;
  return data as T[];
}

export async function saveRow(table: string, id: string | null, row: Record<string, unknown>) {
  const payload = { ...row, updated_at: new Date().toISOString() };
  const { error } = id ? await db().from(table).update(payload).eq("id", id) : await db().from(table).insert(payload);
  if (error) {
    if (error.code === "23505") throw new Error("Esiste già una voce con lo stesso nome.");
    throw new Error(`Salvataggio non riuscito: ${error.message}`);
  }
}

export async function deleteRow(table: string, id: string) {
  const { error } = await db().from(table).delete().eq("id", id);
  if (error) throw new Error(`Cancellazione non riuscita: ${error.message}`);
}

/** Sposta una riga di un posto: rinumera tutto l'elenco, così non restano posizioni uguali. */
export async function moveRow<T extends { id: string }>(table: string, list: T[], index: number, delta: -1 | 1) {
  const target = index + delta;
  if (target < 0 || target >= list.length) return;
  const ids = list.map((r) => r.id);
  [ids[index], ids[target]] = [ids[target]!, ids[index]!];
  for (const [i, id] of ids.entries()) {
    const { error } = await db().from(table).update({ sort: i + 1 }).eq("id", id);
    if (error) throw error;
  }
}

/** Il prossimo numero d'ordine, per mettere in fondo una voce nuova. */
export const nextSort = (list: { sort: number }[]) => Math.max(0, ...list.map((r) => r.sort)) + 1;
