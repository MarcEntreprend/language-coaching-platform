// app/(student)/dashboard/book/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, startOfDay } from "date-fns";
import { supabase } from "@/lib/supabase/client"; // ✅ import direct de l'instance
import { formatSlotInTimezone } from "@/lib/utils/availability";

type Slot = { startUtc: string; endUtc: string };

export default function BookSessionPage() {
  // const supabase = createClient();   // ❌ à supprimer
  const studentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const rangeStart = useMemo(() => startOfDay(new Date()), []);
  const rangeEnd = useMemo(() => addDays(rangeStart, 21), [rangeStart]);

  useEffect(() => {
    async function loadSlots() {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `/api/availability?start=${rangeStart.toISOString()}&end=${rangeEnd.toISOString()}`,
      );
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Erreur de chargement.");
        setLoading(false);
        return;
      }

      setSlots(json.slots);
      setLoading(false);
    }

    loadSlots();
  }, [rangeStart, rangeEnd]);

  async function handleBook() {
    if (!selectedSlot) return;
    setSubmitting(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser(); // ✅ supabase est disponible

    if (!user) {
      setError("Tu dois être connecté pour réserver.");
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionStart: selectedSlot.startUtc,
        sessionEnd: selectedSlot.endUtc,
        promoCode: promoCode.trim() || null,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Erreur lors de la réservation.");
      setSubmitting(false);
      return;
    }

    setSuccessMessage("Session réservée avec succès !");
    setSelectedSlot(null);
    setSlots((prev) =>
      prev.filter((s) => s.startUtc !== selectedSlot.startUtc),
    );
    setSubmitting(false);
  }

  // Grouper les créneaux par jour pour l'affichage
  const slotsByDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const slot of slots) {
      const dayKey = formatSlotInTimezone(slot.startUtc, studentTimezone).split(
        " à ",
      )[0];
      if (!map.has(dayKey)) map.set(dayKey, []);
      map.get(dayKey)!.push(slot);
    }
    return map;
  }, [slots, studentTimezone]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Réserver une session
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Heures affichées dans ton fuseau :{" "}
          <span className="font-medium">{studentTimezone}</span>
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          {successMessage}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Chargement des créneaux...</p>
      ) : slotsByDay.size === 0 ? (
        <p className="text-sm text-slate-500">
          Aucun créneau disponible dans les 3 prochaines semaines.
        </p>
      ) : (
        <div className="space-y-6">
          {Array.from(slotsByDay.entries()).map(([day, daySlots]) => (
            <div key={day}>
              <h2 className="text-sm font-semibold text-slate-700 mb-2">
                {day}
              </h2>
              <div className="flex flex-wrap gap-2">
                {daySlots.map((slot) => (
                  <button
                    key={slot.startUtc}
                    onClick={() => setSelectedSlot(slot)}
                    className={`text-sm px-3 py-2 rounded-lg border transition-colors ${
                      selectedSlot?.startUtc === slot.startUtc
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-300 hover:border-slate-900"
                    }`}
                  >
                    {
                      formatSlotInTimezone(
                        slot.startUtc,
                        studentTimezone,
                      ).split(" à ")[1]
                    }
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSlot && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Créneau sélectionné</p>
              <p className="font-medium text-slate-900">
                {formatSlotInTimezone(selectedSlot.startUtc, studentTimezone)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                placeholder="Code promo (optionnel)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                onClick={handleBook}
                disabled={submitting}
                className="bg-slate-900 text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
              >
                {submitting ? "Réservation..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// de claude :

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { addDays, startOfDay } from "date-fns";
// import { createClient } from "@/lib/supabase/client";
// import { formatSlotInTimezone } from "@/lib/utils/availability";

// type Slot = { startUtc: string; endUtc: string };

// export default function BookSessionPage() {
//   const supabase = createClient();
//   const studentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

//   const [slots, setSlots] = useState<Slot[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
//   const [promoCode, setPromoCode] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);

//   const rangeStart = useMemo(() => startOfDay(new Date()), []);
//   const rangeEnd = useMemo(() => addDays(rangeStart, 21), [rangeStart]);

//   useEffect(() => {
//     async function loadSlots() {
//       setLoading(true);
//       setError(null);

//       const res = await fetch(
//         `/api/availability?start=${rangeStart.toISOString()}&end=${rangeEnd.toISOString()}`,
//       );
//       const json = await res.json();

//       if (!res.ok) {
//         setError(json.error ?? "Erreur de chargement.");
//         setLoading(false);
//         return;
//       }

//       setSlots(json.slots);
//       setLoading(false);
//     }

//     loadSlots();
//   }, [rangeStart, rangeEnd]);

//   async function handleBook() {
//     if (!selectedSlot) return;
//     setSubmitting(true);
//     setError(null);

//     const {
//       data: { user },
//     } = await supabase.auth.getUser();

//     if (!user) {
//       setError("Tu dois être connecté pour réserver.");
//       setSubmitting(false);
//       return;
//     }

//     const res = await fetch("/api/bookings", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         sessionStart: selectedSlot.startUtc,
//         sessionEnd: selectedSlot.endUtc,
//         promoCode: promoCode.trim() || null,
//       }),
//     });

//     const json = await res.json();

//     if (!res.ok) {
//       setError(json.error ?? "Erreur lors de la réservation.");
//       setSubmitting(false);
//       return;
//     }

//     setSuccessMessage("Session réservée avec succès !");
//     setSelectedSlot(null);
//     setSlots((prev) =>
//       prev.filter((s) => s.startUtc !== selectedSlot.startUtc),
//     );
//     setSubmitting(false);
//   }

//   // Grouper les créneaux par jour pour l'affichage
//   const slotsByDay = useMemo(() => {
//     const map = new Map<string, Slot[]>();
//     for (const slot of slots) {
//       const dayKey = formatSlotInTimezone(slot.startUtc, studentTimezone).split(
//         " à ",
//       )[0];
//       if (!map.has(dayKey)) map.set(dayKey, []);
//       map.get(dayKey)!.push(slot);
//     }
//     return map;
//   }, [slots, studentTimezone]);

//   return (
//     <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
//       <div>
//         <h1 className="text-2xl font-semibold text-slate-900">
//           Réserver une session
//         </h1>
//         <p className="text-sm text-slate-500 mt-1">
//           Heures affichées dans ton fuseau :{" "}
//           <span className="font-medium">{studentTimezone}</span>
//         </p>
//       </div>

//       {error && (
//         <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
//           {error}
//         </div>
//       )}
//       {successMessage && (
//         <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
//           {successMessage}
//         </div>
//       )}

//       {loading ? (
//         <p className="text-sm text-slate-500">Chargement des créneaux...</p>
//       ) : slotsByDay.size === 0 ? (
//         <p className="text-sm text-slate-500">
//           Aucun créneau disponible dans les 3 prochaines semaines.
//         </p>
//       ) : (
//         <div className="space-y-6">
//           {Array.from(slotsByDay.entries()).map(([day, daySlots]) => (
//             <div key={day}>
//               <h2 className="text-sm font-semibold text-slate-700 mb-2">
//                 {day}
//               </h2>
//               <div className="flex flex-wrap gap-2">
//                 {daySlots.map((slot) => (
//                   <button
//                     key={slot.startUtc}
//                     onClick={() => setSelectedSlot(slot)}
//                     className={`text-sm px-3 py-2 rounded-lg border transition-colors ${
//                       selectedSlot?.startUtc === slot.startUtc
//                         ? "bg-slate-900 text-white border-slate-900"
//                         : "bg-white text-slate-700 border-slate-300 hover:border-slate-900"
//                     }`}
//                   >
//                     {
//                       formatSlotInTimezone(
//                         slot.startUtc,
//                         studentTimezone,
//                       ).split(" à ")[1]
//                     }
//                   </button>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {selectedSlot && (
//         <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
//           <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
//             <div>
//               <p className="text-sm text-slate-500">Créneau sélectionné</p>
//               <p className="font-medium text-slate-900">
//                 {formatSlotInTimezone(selectedSlot.startUtc, studentTimezone)}
//               </p>
//             </div>
//             <div className="flex items-center gap-3">
//               <input
//                 placeholder="Code promo (optionnel)"
//                 value={promoCode}
//                 onChange={(e) => setPromoCode(e.target.value)}
//                 className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
//               />
//               <button
//                 onClick={handleBook}
//                 disabled={submitting}
//                 className="bg-slate-900 text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
//               >
//                 {submitting ? "Réservation..." : "Confirmer"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
