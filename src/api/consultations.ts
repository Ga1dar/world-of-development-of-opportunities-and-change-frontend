import { endpoints } from "./endpoints";

export type ConsultationBookingPayload = {
  specialist: number;
  date: string;
  time: string;
};

export type ConsultationBookingResult =
  | { status: "success" }
  | { status: "busy" }
  | { status: "error" };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

const isConflictStatus = (status: number) => status === 409 || status === 423;

const hasBusyMarker = (value: unknown): boolean => {
  if (typeof value === "string") {
    return /busy|taken|unavailable|\u0437\u0430\u0439\u043d\u044f\u0442|\u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f/i.test(value);
  }

  if (Array.isArray(value)) {
    return value.some(hasBusyMarker);
  }

  if (value && typeof value === "object") {
    return Object.values(value).some(hasBusyMarker);
  }

  return false;
};

export async function bookConsultation(
  payload: ConsultationBookingPayload,
  signal?: AbortSignal,
): Promise<ConsultationBookingResult> {
  if (
    !Number.isInteger(payload.specialist) ||
    payload.specialist <= 0 ||
    !DATE_PATTERN.test(payload.date) ||
    !TIME_PATTERN.test(payload.time)
  ) {
    return { status: "error" };
  }

  const accessToken = localStorage.getItem("accessToken");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(endpoints.consultationBooking, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
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
