import { endpoints } from "./endpoints";

export type ConsultationSlot = {
  id: number;
  date: string;
  time: string;
  startsAt: string;
};

export type ConsultationBookingPayload = {
  slot: number;
};

export type ConsultationBookingResult =
  | { status: "success" }
  | { status: "busy" }
  | { status: "error" };

type RawRecord = Record<string, unknown>;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

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

const getAuthHeaders = () => {
  const accessToken =
    typeof window === "undefined" ? "" : localStorage.getItem("accessToken") || "";
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
};

const formatDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTimeValue = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
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
    startsAt = `${date}T${time}:00`;
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
    const response = await fetch(endpoints.consultationSlots(specialistId), {
      signal,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch consultation slots");
    }

    const data = await response.json().catch(() => null);
    return extractList(data)
      .map(normalizeSlot)
      .filter((slot): slot is ConsultationSlot => Boolean(slot))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    console.error(error);
    return [];
  }
}

export async function bookConsultation(
  payload: ConsultationBookingPayload,
  signal?: AbortSignal,
): Promise<ConsultationBookingResult> {
  if (!Number.isInteger(payload.slot) || payload.slot <= 0) {
    return { status: "error" };
  }

  try {
    const response = await fetch(endpoints.consultationAppointments, {
      method: "POST",
      headers: getAuthHeaders(),
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
