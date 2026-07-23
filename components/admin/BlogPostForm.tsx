// components/admin/BlogPostForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils/slugify";

type Category = { id: string; name: string };

type PostFormData = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category_id: string;
  meta_title: string;
  meta_description: string;
  og_image_url: string;
  cover_image_url: string;
  is_published: boolean;
};

export default function BlogPostForm({
  mode,
  categories,
  initialData,
}: {
  mode: "create" | "edit";
  categories: Category[];
  initialData?: PostFormData;
}) {
  const router = useRouter();

  const [form, setForm] = useState<PostFormData>(
    initialData ?? {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category_id: categories[0]?.id ?? "",
      meta_title: "",
      meta_description: "",
      og_image_url: "",
      cover_image_url: "",
      is_published: false,
    },
  );
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTitleChange(value: string) {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: slugManuallyEdited ? prev.slug : slugify(value),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const endpoint =
      mode === "create"
        ? "/api/admin/blog/posts"
        : `/api/admin/blog/posts/${form.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Erreur lors de la sauvegarde.");
      return;
    }

    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-slate-700">Titre</label>
        <input
          required
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Slug (URL)</label>
        <input
          required
          value={form.slug}
          onChange={(e) => {
            setSlugManuallyEdited(true);
            setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }));
          }}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
        />
        <p className="mt-1 text-xs text-slate-400">
          /blog/{form.slug || "..."}
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Catégorie</label>
        <select
          value={form.category_id}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, category_id: e.target.value }))
          }
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Aucune</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          Extrait (résumé court)
        </label>
        <textarea
          rows={2}
          value={form.excerpt}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, excerpt: e.target.value }))
          }
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          Contenu (Markdown)
        </label>
        <textarea
          required
          rows={16}
          value={form.content}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, content: e.target.value }))
          }
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
          placeholder={"## Titre de section\n\nTon contenu en **Markdown**..."}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          Image de couverture (URL)
        </label>
        <input
          value={form.cover_image_url}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, cover_image_url: e.target.value }))
          }
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="https://..."
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          SEO (optionnel)
        </p>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Meta titre
          </label>
          <input
            value={form.meta_title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, meta_title: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Par défaut : le titre de l'article"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Meta description
          </label>
          <textarea
            rows={2}
            value={form.meta_description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, meta_description: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Par défaut : l'extrait, ou un résumé auto-généré"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Image Open Graph (URL)
          </label>
          <input
            value={form.og_image_url}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, og_image_url: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Par défaut : l'image de couverture"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={form.is_published}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, is_published: e.target.checked }))
          }
          className="rounded border-slate-300"
        />
        Publier immédiatement
      </label>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {saving
          ? "Sauvegarde..."
          : mode === "create"
            ? "Créer l'article"
            : "Enregistrer les modifications"}
      </button>
    </form>
  );
}
