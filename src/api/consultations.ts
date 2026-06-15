import { endpoints } from "./endpoints";
import { apiFetch } from "./auth";

export type ConsultationSlot = {
  id: number;
  date: string;
  time: string;
  startsAt: string;
  specialistId?: number;
};

export type ConsultationBookingPayload = {
  slot?: number;
  specialist?: number;
  date?: string;
  time?: string;
  start_time?: string;
};

export type ConsultationBookingResult =
  | { status: "success" }
  | { status: "busy" }
  | { status: "error" };

export type ConsultationMutationResult = ConsultationBookingResult;

type RawRecord = Record<string, unknown>;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;
const CONSULTATION_TIME_ZONE = "Europe/Kyiv";
const MAX_SLOT_PAGES = 100;

export const CONSULTATION_TIME_OPTIONS = Array.from({ length: 11 }, (_, index) => {
  const totalMinutes = 9 * 60 + index * 30;
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");

  return `${hours}:${minutes}`;
});

const CONSULTATION_TIME_SET = new Set(CONSULTATION_TIME_OPTIONS);

export const isConsultationBusinessTime = (time: string) =>
  CONSULTATION_TIME_SET.has(time.slice(0, 5));

const asRecord = (value: unknown): RawRecord | null =>
  value && typeof value === "object" ? (value as RawRecord) : null;

const asString = (value: unknown, fallback = "") => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
};

const asNumber = (value: unknown, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const extractList = (data: unknown) => {
  if (Array.isArray(data)) return data;

  const record = asRecord(data);
  if (!record) return [];

  for (const key of ["results", "slots", "data"]) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }

  return [];
};

const getNextPage = (data: unknown) => {
  const record = asRecord(data);
  return record ? asString(record.next) : "";
};

const getZonedDateTimeParts = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CONSULTATION_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
};

const formatDateValue = (date: Date) => {
  const parts = getZonedDateTimeParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const formatTimeValue = (date: Date) => {
  const parts = getZonedDateTimeParts(date);
  return `${parts.hour}:${parts.minute}`;
};

export const consultationLocalTimeToIso = (date: string, time: string) => {
  if (!DATE_PATTERN.test(date) || !TIME_PATTERN.test(time)) return "";

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const targetWallClock = Date.UTC(year, month - 1, day, hour, minute);
  let instant = targetWallClock;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = getZonedDateTimeParts(new Date(instant));
    const representedWallClock = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
    );
    const correction = targetWallClock - representedWallClock;

    if (correction === 0) break;
    instant += correction;
  }

  return new Date(instant).toISOString();
};

const isPastSlot = (startsAt: string) => {
  const startsAtDate = new Date(startsAt);

  return !Number.isNaN(startsAtDate.getTime()) && startsAtDate.getTime() <= Date.now();
};

const normalizeSlot = (raw: unknown): ConsultationSlot | null => {
  const record = asRecord(raw);
  if (!record) return null;

  const id = asNumber(record.id);
  const rawStart =
    asString(record.start_time) ||
    asString(record.startTime) ||
    asString(record.starts_at) ||
    asString(record.startsAt) ||
    asString(record.datetime) ||
    asString(record.date_time);
  const rawDate = asString(record.date);
  const rawTime = asString(record.time);

  let date = DATE_PATTERN.test(rawDate) ? rawDate : "";
  let time = TIME_PATTERN.test(rawTime) ? rawTime : "";
  let startsAt = rawStart;

  if (rawStart) {
    const parsedDate = new Date(rawStart);
    if (!Number.isNaN(parsedDate.getTime())) {
      date ||= formatDateValue(parsedDate);
      time ||= formatTimeValue(parsedDate);
      startsAt = parsedDate.toISOString();
    }
  }

  if (!startsAt && date && time) {
    startsAt = consultationLocalTimeToIso(date, time);
  }

  if (!id || !date || !time) return null;

  return {
    id,
    date,
    time,
    startsAt,
  };
};

const isConflictStatus = (status: number) => status === 409 || status === 423;

const hasBusyMarker = (value: unknown): boolean => {
  if (typeof value === "string") {
    return /busy|taken|unavailable|booked|зайнят|недоступ/i.test(value);
  }

  if (Array.isArray(value)) {
    return value.some(hasBusyMarker);
  }

  const record = asRecord(value);
  return record ? Object.values(record).some(hasBusyMarker) : false;
};

export async function getConsultationSlots(
  specialistId: number,
  signal?: AbortSignal,
) {
  if (!Number.isInteger(specialistId) || specialistId <= 0) {
    return [];
  }

  try {
    const rawSlots: unknown[] = [];
    let nextPage = endpoints.consultationSlots(specialistId);
    let pageCount = 0;

    while (nextPage && pageCount < MAX_SLOT_PAGES) {
      const response = await fetch(nextPage, { signal });

      if (!response.ok) {
        throw new Error("Failed to fetch consultation slots");
      }

      const data = await response.json().catch(() => null);
      rawSlots.push(...extractList(data));
      nextPage = getNextPage(data);
      pageCount += 1;
    }

    const slots = rawSlots
      .map(normalizeSlot)
      .filter((slot): slot is ConsultationSlot => Boolean(slot))
      .filter((slot) => !isPastSlot(slot.startsAt))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

    return slots;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    console.error(error);
    throw error;
  }
}

export async function createConsultationSlots(
  startTimes: string[],
): Promise<ConsultationMutationResult> {
  const normalizedStartTimes = startTimes
    .map((value) => value.trim())
    .filter(Boolean);

  if (!normalizedStartTimes.length) {
    return { status: "error" };
  }

  try {
    const response = await apiFetch(endpoints.consultationSlotBulkCreate, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ start_times: normalizedStartTimes }),
    });

    return response.ok ? { status: "success" } : { status: "error" };
  } catch {
    return { status: "error" };
  }
}

export async function deleteConsultationSlot(
  slotId: string | number,
): Promise<ConsultationMutationResult> {
  if (!slotId) {
    return { status: "error" };
  }

  try {
    const response = await apiFetch(endpoints.consultationSlot(slotId), {
      method: "DELETE",
    });

    return response.ok || response.status === 204
      ? { status: "success" }
      : { status: "error" };
  } catch {
    return { status: "error" };
  }
}

export async function bookConsultation(
  payload: ConsultationBookingPayload,
  signal?: AbortSignal,
): Promise<ConsultationBookingResult> {
  const hasRealSlot = Number.isInteger(payload.slot) && Number(payload.slot) > 0;

  if (!hasRealSlot) {
    return { status: "error" };
  }

  try {
    const response = await apiFetch(endpoints.consultationAppointments, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slot: payload.slot }),
      signal,
    });

    if (response.ok) {
      return { status: "success" };
    }

    if (isConflictStatus(response.status)) {
      return { status: "busy" };
    }

    if (response.status === 400) {
      const data = (await response.json().catch(() => null)) as unknown;

      if (hasBusyMarker(data)) {
        return { status: "busy" };
      }
    }

    return { status: "error" };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    return { status: "error" };
  }
}

export async function cancelConsultationAppointment(
  appointmentId: string | number,
): Promise<ConsultationMutationResult> {
  try {
    const response = await apiFetch(endpoints.consultationAppointmentCancel(appointmentId), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.ok ? { status: "success" } : { status: "error" };
  } catch {
    return { status: "error" };
  }
}

export async function rescheduleConsultationAppointment(
  appointmentId: string | number,
  slotId: number,
): Promise<ConsultationMutationResult> {
  if (!Number.isInteger(slotId) || slotId <= 0) {
    return { status: "error" };
  }

  try {
    const response = await apiFetch(
      endpoints.consultationAppointmentReschedule(appointmentId),
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slot: slotId }),
      },
    );

    if (response.ok) {
      return { status: "success" };
    }

    if (isConflictStatus(response.status)) {
      return { status: "busy" };
    }

    if (response.status === 400) {
      const data = (await response.json().catch(() => null)) as unknown;

      if (hasBusyMarker(data)) {
        return { status: "busy" };
      }
    }

    return { status: "error" };
  } catch {
    return { status: "error" };
  }
}
