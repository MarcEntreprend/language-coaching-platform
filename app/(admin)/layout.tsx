// app/(admin)/layout.tsx
import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user } = await requireAdmin();

  let unreadCount = 0;
  if (user) {
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .eq("is_read", false);
    unreadCount = count ?? 0;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link href="/admin" className="text-lg font-semibold text-slate-900">
            Speak with Marc — Admin
          </Link>
          <div className="flex flex-wrap items-center gap-5 text-sm font-medium">
            <Link href="/admin" className="text-slate-600 hover:text-slate-900">
              Tableau de bord
            </Link>
            <Link
              href="/admin/bookings"
              className="text-slate-600 hover:text-slate-900"
            >
              Réservations
            </Link>
            <Link
              href="/admin/students"
              className="text-slate-600 hover:text-slate-900"
            >
              Étudiants
            </Link>
            <Link
              href="/admin/blog"
              className="text-slate-600 hover:text-slate-900"
            >
              Blog
            </Link>
            <Link
              href="/admin/blog/comments"
              className="text-slate-600 hover:text-slate-900"
            >
              Commentaires
            </Link>
            <Link
              href="/admin/availability"
              className="text-slate-600 hover:text-slate-900"
            >
              Disponibilités
            </Link>
            <Link
              href="/admin/messages"
              className="relative text-slate-600 hover:text-slate-900"
            >
              Messages
              {unreadCount > 0 && (
                <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[9px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/admin/settings"
              className="text-slate-600 hover:text-slate-900"
            >
              Réglages
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
