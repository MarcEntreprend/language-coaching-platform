// app/(admin)/admin/blog/categories/page.tsx

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils/slugify";

type Category = { id: string; name: string; slug: string };

export default function AdminBlogCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function loadCategories() {
    setLoading(true);
    const { data } = await supabase
      .from("blog_categories")
      .select("*")
      .order("name", { ascending: true });
    setCategories(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!newName.trim()) return;

    const { error: insertError } = await supabase
      .from("blog_categories")
      .insert({
        name: newName.trim(),
        slug: slugify(newName.trim()),
      });

    if (insertError) {
      setError(
        insertError.code === "23505"
          ? "Une catégorie avec ce nom existe déjà."
          : insertError.message,
      );
      return;
    }

    setNewName("");
    await loadCategories();
  }

  async function handleDelete(id: string) {
    await supabase.from("blog_categories").delete().eq("id", id);
    await loadCategories();
  }

  return (
    <div className="max-w-lg mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        Catégories du blog
      </h1>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nom de la catégorie"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Ajouter
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
        {loading ? (
          <p className="px-4 py-6 text-sm text-slate-500">Chargement...</p>
        ) : categories.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">Aucune catégorie.</p>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-sm text-slate-900">{cat.name}</span>
              <button
                onClick={() => handleDelete(cat.id)}
                className="text-xs font-medium text-red-600 hover:text-red-700"
              >
                Supprimer
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
