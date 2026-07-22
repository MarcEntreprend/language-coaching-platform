// lib/utils/availability.ts
import {
  addDays,
  addMinutes,
  format,
  isBefore,
  isEqual,
  startOfDay,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export type CoachAvailabilityRow = {
  day_of_week: number; // 0 = dimanche ... 6 = samedi
  start_time: string; // "10:00:00"
  end_time: string; // "18:00:00"
  timezone: string;
};

export type BookingRow = {
  session_start: string; // ISO
  session_end: string; // ISO
  status: string;
};

export type TimeSlot = {
  startUtc: string; // ISO en UTC
  endUtc: string; // ISO en UTC
};

const SESSION_DURATION_MINUTES = 60;
const SLOT_STEP_MINUTES = 30; // granularité des créneaux proposés

/**
 * Génère tous les créneaux possibles pour une plage de dates donnée,
 * en excluant ceux déjà réservés, et en respectant le fuseau horaire du coach.
 */
export function computeAvailableSlots(
  availabilityRules: CoachAvailabilityRow[],
  existingBookings: BookingRow[],
  rangeStartUtc: Date,
  rangeEndUtc: Date,
): TimeSlot[] {
  const activeBookings = existingBookings.filter(
    (b) => b.status !== "cancelled",
  );
  const slots: TimeSlot[] = [];

  let cursorDay = startOfDay(rangeStartUtc);

  while (isBefore(cursorDay, rangeEndUtc) || isEqual(cursorDay, rangeEndUtc)) {
    const dayOfWeek = cursorDay.getUTCDay();

    const rulesForDay = availabilityRules.filter(
      (r) => r.day_of_week === dayOfWeek,
    );

    for (const rule of rulesForDay) {
      const [startH, startM] = rule.start_time.split(":").map(Number);
      const [endH, endM] = rule.end_time.split(":").map(Number);

      // Construire l'heure de début/fin dans le fuseau du coach, puis convertir en UTC
      const dayStr = format(cursorDay, "yyyy-MM-dd");
      const zonedStart = fromZonedTime(
        `${dayStr} ${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}:00`,
        rule.timezone,
      );
      const zonedEnd = fromZonedTime(
        `${dayStr} ${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`,
        rule.timezone,
      );

      let slotCursor = zonedStart;

      while (addMinutes(slotCursor, SESSION_DURATION_MINUTES) <= zonedEnd) {
        const slotEnd = addMinutes(slotCursor, SESSION_DURATION_MINUTES);

        const isInRange = slotCursor >= rangeStartUtc && slotEnd <= rangeEndUtc;
        const isNotPast = slotCursor > new Date();

        const overlapsBooking = activeBookings.some((b) => {
          const bStart = new Date(b.session_start);
          const bEnd = new Date(b.session_end);
          return slotCursor < bEnd && slotEnd > bStart;
        });

        if (isInRange && isNotPast && !overlapsBooking) {
          slots.push({
            startUtc: slotCursor.toISOString(),
            endUtc: slotEnd.toISOString(),
          });
        }

        slotCursor = addMinutes(slotCursor, SLOT_STEP_MINUTES);
      }
    }

    cursorDay = addDays(cursorDay, 1);
  }

  return slots.sort((a, b) => a.startUtc.localeCompare(b.startUtc));
}

/**
 * Convertit un créneau UTC vers l'heure locale d'un fuseau donné, pour affichage.
 */
export function formatSlotInTimezone(isoUtc: string, timezone: string): string {
  const zoned = toZonedTime(new Date(isoUtc), timezone);
  return format(zoned, "EEEE d MMMM 'à' HH:mm");
}

/**
 * Règle des 24h : true si la session est modifiable/annulable (démarre dans plus de 24h).
 */
export function isWithinCancellationWindow(sessionStartUtc: string): boolean {
  const sessionStart = new Date(sessionStartUtc);
  const now = new Date();
  const hoursUntilSession =
    (sessionStart.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilSession >= 24;
}
