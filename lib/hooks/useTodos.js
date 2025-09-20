// lib/hooks/useTodos.js
"use client";

import { useEffect, useState, useRef } from "react";
import {
  db,
  fetchAndCacheTodosFromSupabase,
  localAddTodo,
  localUpdateTodo,
  localDeleteTodo,
  syncTodos,
} from "../localDB";

export function useTodos() {
  const [todos, setTodos] = useState([]);
  const syncing = useRef(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (navigator.onLine) {
        try {
          await fetchAndCacheTodosFromSupabase();
        } catch (err) {
          console.warn("Could not fetch from supabase, fallback to local", err);
        }
      }
      const local = await db.todos.toArray();
      if (mounted) setTodos(local);
    }
    load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onOnline = async () => {
      if (syncing.current) return;
      syncing.current = true;
      try {
        // First push local changes
        await syncTodos();

        // Then refresh Dexie from server (latest state after sync)
        await fetchAndCacheTodosFromSupabase();

        // Finally refresh state in React
        setTodos(await db.todos.toArray());
      } catch (err) {
        console.error("Sync failed:", err);
      } finally {
        syncing.current = false;
      }
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  async function addTodoLocal(text, dueDate = null) {
    const id =
      crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const payload = { id, todo: text, done: false, due_date: dueDate };
    await localAddTodo(payload);
    setTodos(await db.todos.toArray());
    if (navigator.onLine) await syncTodos();
  }

  async function toggleDoneLocal(id) {
    const row = await db.todos.get(id);
    if (!row) return;
    await localUpdateTodo(id, { done: !row.done });
    setTodos(await db.todos.toArray());
    if (navigator.onLine) await syncTodos();
  }

  async function deleteLocal(id) {
    await localDeleteTodo(id);
    setTodos(await db.todos.toArray());
    if (navigator.onLine) await syncTodos();
  }

  return {
    todos,
    addTodoLocal,
    toggleDoneLocal,
    deleteLocal,
    syncNow: async () => {
      await syncTodos();
      await fetchAndCacheTodosFromSupabase();
      setTodos(await db.todos.toArray());
    },
  };
}
