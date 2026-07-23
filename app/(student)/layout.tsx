// app/(student)/layout.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { count: unreadCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .eq("is_read", false);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link
            href="/dashboard"
            className="text-lg font-semibold text-slate-900"
          >
            Speak with Marc
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className="text-slate-600 hover:text-slate-900"
            >
              Tableau de bord
            </Link>
            <Link
              href="/dashboard/book"
              className="text-slate-600 hover:text-slate-900"
            >
              Réserver
            </Link>
            <Link
              href="/dashboard/messages"
              className="relative text-slate-600 hover:text-slate-900"
            >
              Messages
              {!!unreadCount && (
                <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[9px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
