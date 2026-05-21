import { endpoints } from "./endpoints";
import { clearFavoriteContentItems } from "./userFavorites";

type CurrentUserRecord = Record<string, unknown>;

const asRecord = (value: unknown): CurrentUserRecord | null =>
  value && typeof value === "object" ? (value as CurrentUserRecord) : null;

const readBoolean = (record: CurrentUserRecord | null, keys: string[]) => {
  if (!record) return false;

  return keys.some((key) => record[key] === true);
};

const hasSpecialistProfile = (record: CurrentUserRecord | null) => {
  if (!record) return false;

  if (record.is_verified === true) return true;

  const directProfile =
    record.specialist_profile ??
    record.specialistProfile ??
    record.specialist ??
    record.specialist_id ??
    record.specialistProfileId;

  if (directProfile === null || directProfile === undefined || directProfile === false) {
    return false;
  }

  if (typeof directProfile === "number") return directProfile > 0;
  if (typeof directProfile === "string") return directProfile.trim().length > 0;
  if (typeof directProfile === "object") return true;

  return false;
};

const canCreateEventsFromRecord = (record: CurrentUserRecord | null) => {
  if (!record) return false;

  return (
    readBoolean(record, ["is_staff", "isStaff", "staff", "is_superuser"]) ||
    hasSpecialistProfile(record)
  );
};

const decodeJwtPayload = (token: string) => {
  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "=",
    );

    return asRecord(JSON.parse(atob(paddedPayload)));
  } catch {
    return null;
  }
};

export const getAccessToken = () =>
  typeof window === "undefined" ? "" : localStorage.getItem("accessToken") || "";

export const getStoredCurrentUser = () => {
  if (typeof window === "undefined") return null;

  try {
    return asRecord(JSON.parse(localStorage.getItem("currentUser") || "null"));
  } catch {
    return null;
  }
};

export const storeCurrentUser = (user: unknown) => {
  const record = asRecord(user);
  if (!record || typeof window === "undefined") return;

  localStorage.setItem("currentUser", JSON.stringify(record));
};

export const notifyAuthChanged = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-changed"));
  }
};

const clearLocalSession = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("svityLikedEventIds");
  clearFavoriteContentItems();
};

export async function logoutCurrentUser() {
  if (typeof window === "undefined") return;

  const accessToken = getAccessToken();
  const refresh = localStorage.getItem("refreshToken") || "";

  try {
    if (refresh) {
      await fetch(endpoints.logout, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ refresh }),
      });
    }
  } finally {
    clearLocalSession();
    notifyAuthChanged();
  }
}

export const canCreateEventsFromStoredToken = () =>
  canCreateEventsFromRecord(getStoredCurrentUser()) ||
  canCreateEventsFromRecord(decodeJwtPayload(getAccessToken()));

export async function canCurrentUserCreateEvents() {
  const accessToken = getAccessToken();
  if (!accessToken) return false;

  try {
    const response = await fetch(endpoints.me, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return canCreateEventsFromStoredToken();
    }

    const data = await response.json().catch(() => null);
    storeCurrentUser(data);
    return canCreateEventsFromRecord(asRecord(data));
  } catch {
    return canCreateEventsFromStoredToken();
  }
}
