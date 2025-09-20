// lib/localDB.js
import Dexie from "dexie";
import { supabase } from "./supabaseClient";

// Dexie DB
export const db = new Dexie("todo_app_db");
db.version(2).stores({
  // id is UUID now
  todos: "id, todo, done, due_date, syncStatus, last_modified"
});

/**
 * Helpers to add/update/delete locally
 * syncStatus: "pending-insert" | "pending-update" | "pending-delete" | "synced"
 */
export async function localAddTodo(todoObj) {
  const payload = {
    ...todoObj,
    syncStatus: "pending-insert",
    last_modified: new Date().toISOString(),
  };
  await db.todos.add(payload);
  return payload;
}

export async function localUpdateTodo(id, patch) {
  const item = await db.todos.get(id);
  if (!item) return null;

  const nextStatus =
    item.syncStatus === "pending-insert" ? "pending-insert" : "pending-update";

  const next = {
    ...patch,
    syncStatus: nextStatus,
    last_modified: new Date().toISOString(),
  };

  await db.todos.update(id, next);
  return { ...item, ...next };
}

export async function localDeleteTodo(id) {
  const item = await db.todos.get(id);
  if (!item) return null;

  if (item.syncStatus === "pending-insert") {
    // not on server yet → just remove locally
    await db.todos.delete(id);
    return { deletedLocally: true };
  } else {
    // mark as pending-delete
    await db.todos.update(id, {
      syncStatus: "pending-delete",
      last_modified: new Date().toISOString(),
    });
    return { deletedLocally: false };
  }
}

/**
 * Fetch from Supabase and replace local DB
 */
export async function fetchAndCacheTodosFromSupabase() {
  // don’t overwrite if there are local pending changes
  const pending = await db.todos.where("syncStatus").notEqual("synced").toArray();
  if (pending.length > 0) {
    console.log("Skipping overwrite because pending changes exist");
    return;
  }

  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;

  await db.todos.clear();
  if (data?.length) {
    const mapped = data.map((r) => ({
      id: r.id,
      todo: r.todo,
      done: r.done,
      due_date: r.due_date,
      syncStatus: "synced",
      last_modified: r.updated_at || new Date().toISOString(),
    }));
    await db.todos.bulkAdd(mapped);
  }
  return data;
}


/**
 * Sync local ↔ Supabase
 */
export async function syncTodos() {
  if (syncTodos._running) return;
  syncTodos._running = true;

  try {
    const pending = await db.todos
      .where("syncStatus")
      .notEqual("synced")
      .toArray();

    for (const row of pending) {
      const { id, syncStatus } = row;

      if (syncStatus === "pending-insert") {
        const { error } = await supabase.from("todos").insert([
          {
            id: row.id,
            todo: row.todo,
            done: row.done,
            due_date: row.due_date,
          },
        ]);

        if (error) {
          console.error("Insert failed", error);
        } else {
          await db.todos.update(id, { syncStatus: "synced" });
        }
      } else if (syncStatus === "pending-update") {
        const { data: serverRow } = await supabase
          .from("todos")
          .select("updated_at")
          .eq("id", id)
          .maybeSingle();

        if (!serverRow) {
          await db.todos.delete(id);
          continue;
        }

        const localTime = new Date(row.last_modified).getTime();
        const serverTime = serverRow.updated_at
          ? new Date(serverRow.updated_at).getTime()
          : 0;

        if (serverTime > localTime) {
          console.log("Server newer → skipping local update");
          continue;
        }

        const { error: updErr } = await supabase
          .from("todos")
          .update({
            todo: row.todo,
            done: row.done,
            due_date: row.due_date,
          })
          .eq("id", id);

        if (updErr) {
          console.error("Update failed", updErr);
        } else {
          await db.todos.update(id, { syncStatus: "synced" });
        }
      } else if (syncStatus === "pending-delete") {
        await supabase.from("todos").delete().eq("id", id);
        await db.todos.delete(id);
      }
    }
  } catch (err) {
    console.error("SyncTodos error:", err);
  } finally {
    syncTodos._running = false;
  }
}
