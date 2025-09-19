"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import SwipeableListItem from "../../components/shopping_list/SwipeableListItem";

export default function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  // Load todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("due_date", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching todos:", error);
    } else {
      setTodos(data);
    }
  }

  async function addTodo(e) {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const { data, error } = await supabase
      .from("todos")
      .insert([{ todo: newTodo, done: false }])
      .select()
      .single();

    if (error) {
      console.error("Error adding todo:", error);
    } else {
      console.log("New data added")
      setTodos((prev) => [...prev, data]);
      setNewTodo("");
    }
  }

  async function toggleDone(todo) {
    const { data, error } = await supabase
      .from("todos")
      .update({ done: !todo.done })
      .eq("id", todo.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating todo:", error);
    } else {
      console.log("New data set to done")
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, done: data.done } : t))
      );
    }
  }

  async function deleteTodo(id) {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) {
      console.error("Error deleting todo:", error);
    } else {
      console.log("Todo deleted")
      setTodos((prev) => prev.filter((t) => t.id !== id));
    }
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">To-Do List</h1>

      <ul className="space-y-2 mb-6">
        {todos.map((todo) => (
          <SwipeableListItem
            key={todo.id}
            onDelete={() => deleteTodo(todo.id)}
          >
            <li
              className="flex items-center justify-between p-3 border rounded bg-white hover:bg-slate-50 cursor-pointer"
              onClick={() => toggleDone(todo)}
            >
              <div className="flex items-center gap-3">
                {/* Done Circle */}
                <div
                  className={`w-5 h-5 flex items-center justify-center rounded-full border ${
                    todo.done
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-400"
                  }`}
                >
                  {todo.done && "✓"}
                </div>

                {/* Todo text */}
                <span
                  className={`${
                    todo.done ? "line-through text-gray-500" : "text-gray-900"
                  }`}
                >
                  {todo.todo}
                </span>
              </div>

              {/* Delete button (X) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTodo(todo.id);
                }}
                className="text-red-600 hover:text-red-800 ml-4"
              >
                ✕
              </button>
            </li>
          </SwipeableListItem>
        ))}
      </ul>

      {/* Add form (always at bottom) */}
      <form onSubmit={addTodo} className="flex items-center gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new to-do..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add
        </button>
      </form>
    </main>
  );
}
