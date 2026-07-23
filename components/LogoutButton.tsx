// components/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className={
        className ?? "text-sm font-medium text-slate-600 hover:text-slate-900"
      }
    >
      Déconnexion
    </button>
  );
}
