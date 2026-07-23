// app/(student)/layout.tsx
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            <LogoutButton />
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
