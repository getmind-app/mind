import { DateTime } from "luxon";

export function formatISODate(date: Date): string {
    return DateTime.fromISO(date.toISOString()).toLocaleString();
}
