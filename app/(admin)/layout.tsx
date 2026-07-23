// app/(admin)/layout.tsx
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
              href="/admin/blog"
              className="text-slate-600 hover:text-slate-900"
            >
              Blog
            </Link>
            <Link
              href="/admin/students"
              className="text-slate-600 hover:text-slate-900"
            >
              Étudiants
            </Link>
            <Link
              href="/admin/availability"
              className="text-slate-600 hover:text-slate-900"
            >
              Disponibilités
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
