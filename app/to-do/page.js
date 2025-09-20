// app/to-do/page.js
"use client";

import { useState } from "react";
import { useTodos } from "../../lib/hooks/useTodos";
import SwipeableListItem from "../../components/shopping_list/SwipeableListItem";

export default function TodoPage() {
  const { todos, addTodoLocal, toggleDoneLocal, deleteLocal, syncNow } =
    useTodos();
  const [newTodo, setNewTodo] = useState("");

  async function handleAdd(e) {
    e.preventDefault();
    if (!newTodo.trim()) return;
    await addTodoLocal(newTodo.trim(), null);
    setNewTodo("");
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">To-Do List</h1>

      <ul className="space-y-2 mb-6">
        {todos.map((todo) => (
          <SwipeableListItem
            key={todo.id}
            onDelete={() => deleteLocal(todo.id)}
          >
            <li
              className="flex items-center justify-between p-3 border rounded bg-white hover:bg-slate-50 cursor-pointer"
              onClick={() => toggleDoneLocal(todo.id)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 flex items-center justify-center rounded-full border ${
                    todo.done
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-400"
                  }`}
                >
                  {todo.done && "✓"}
                </div>

                <span
                  className={`${
                    todo.done
                      ? "line-through text-gray-500"
                      : "text-gray-900"
                  }`}
                >
                  {todo.todo}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteLocal(todo.id);
                }}
                className="text-red-600 hover:text-red-800 ml-4 hover:cursor-pointer"
              >
                ✕
              </button>
            </li>
          </SwipeableListItem>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new to-do..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 hover:cursor-pointer"
        >
          Add
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-500">
        <button onClick={() => syncNow()} className="underline hover:cursor-pointer">
          Sync now
        </button>
      </div>
    </main>
  );
}
