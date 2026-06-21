import { endpoints } from "./endpoints";

type CurrentUserRecord = Record<string, unknown>;

const asRecord = (value: unknown): CurrentUserRecord | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as CurrentUserRecord)
    : null;

export const normalizeCurrentUserResponse = (value: unknown): CurrentUserRecord | null => {
  if (Array.isArray(value)) {
    return asRecord(value[0]);
  }

  const record = asRecord(value);
  if (!record) return null;

  if (
    record.id !== undefined ||
    record.email !== undefined ||
    record.role !== undefined ||
    record.specialist_profile !== undefined ||
    record.user_profile !== undefined
  ) {
    return record;
  }

  for (const key of ["results", "data", "user", "current_user", "currentUser"]) {
    const nested = record[key];
    const normalized = normalizeCurrentUserResponse(nested);
    if (normalized) return normalized;
  }

  return null;
};

const readBoolean = (record: CurrentUserRecord | null, keys: string[]) => {
  if (!record) return false;

  return keys.some((key) => record[key] === true);
};

const readString = (record: CurrentUserRecord | null, keys: string[]) => {
  if (!record) return "";

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
};

const isAdminRecord = (record: CurrentUserRecord | null) => {
  if (!record) return false;

  const role = readString(record, ["role", "user_role", "userRole"]).toLowerCase();

  return (
    readBoolean(record, ["is_staff", "isStaff", "staff", "is_superuser"]) ||
    role.includes("admin") ||
    role.includes("staff") ||
    role.includes("moderator")
  );
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

  return isAdminRecord(record) || hasSpecialistProfile(record);
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

export const getRefreshToken = () =>
  typeof window === "undefined" ? "" : localStorage.getItem("refreshToken") || "";

export const getStoredCurrentUser = () => {
  if (typeof window === "undefined") return null;

  try {
    return normalizeCurrentUserResponse(
      JSON.parse(localStorage.getItem("currentUser") || "null"),
    );
  } catch {
    return null;
  }
};

export const storeCurrentUser = (user: unknown) => {
  const record = normalizeCurrentUserResponse(user);
  if (!record || typeof window === "undefined") return;

  localStorage.setItem("currentUser", JSON.stringify(record));
};

export const notifyAuthChanged = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-changed"));
  }
};

export const clearStoredCurrentUser = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("currentUser");
};

export const clearLocalSession = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("svityLikedEventIds");
};

const notifyAuthRequired = () => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event("auth-required"));
};

const redirectToLogin = () => {
  if (typeof window === "undefined") return;

  const protectedPaths = [
    "/profile",
    "/events/categories/new",
    "/materials/articles/new",
    "/materials/videos/new",
  ];
  const currentPath = window.location.pathname;
  const isProtectedPath = protectedPaths.some((path) => currentPath.startsWith(path));

  if (isProtectedPath) {
    window.location.assign("/");
  }
};

let refreshTokenRequest: Promise<string | null> | null = null;

const refreshAccessToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  if (!refreshTokenRequest) {
    refreshTokenRequest = fetch(endpoints.tokenRefresh, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        const record = asRecord(data);
        const access = typeof record?.access === "string" ? record.access : "";
        const nextRefresh = typeof record?.refresh === "string" ? record.refresh : "";

        if (!response.ok || !access) {
          return null;
        }

        localStorage.setItem("accessToken", access);

        if (nextRefresh) {
          localStorage.setItem("refreshToken", nextRefresh);
        }

        notifyAuthChanged();
        return access;
      })
      .catch(() => null)
      .finally(() => {
        refreshTokenRequest = null;
      });
  }

  return refreshTokenRequest;
};

const withAuthHeader = (headers: HeadersInit | undefined, accessToken: string) => {
  const nextHeaders = new Headers(headers);

  if (accessToken) {
    nextHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  return nextHeaders;
};

type ApiFetchInit = RequestInit & {
  auth?: boolean;
  redirectOnUnauthorized?: boolean;
};

export async function apiFetch(input: RequestInfo | URL, init: ApiFetchInit = {}) {
  const { auth = true, redirectOnUnauthorized = true, headers, ...fetchInit } = init;
  const accessToken = auth ? getAccessToken() : "";
  const requestInit: RequestInit = {
    ...fetchInit,
    headers: auth ? withAuthHeader(headers, accessToken) : headers,
  };
  let response = await fetch(input, requestInit);

  if (response.status !== 401 || !auth) {
    return response;
  }

  const refreshedAccessToken = await refreshAccessToken();

  if (refreshedAccessToken) {
    response = await fetch(input, {
      ...fetchInit,
      headers: withAuthHeader(headers, refreshedAccessToken),
    });
  }

  if (response.status === 401) {
    clearLocalSession();
    notifyAuthChanged();
    notifyAuthRequired();

    if (redirectOnUnauthorized) {
      redirectToLogin();
    }
  }

  return response;
}

export async function logoutCurrentUser() {
  if (typeof window === "undefined") return;

  const accessToken = getAccessToken();
  const refresh = getRefreshToken();

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
  } catch {
    // Logging out locally must still work when the API is unavailable.
  } finally {
    clearLocalSession();
    notifyAuthChanged();
  }
}

export const canCreateEventsFromStoredToken = () =>
  canCreateEventsFromRecord(getStoredCurrentUser()) ||
  canCreateEventsFromRecord(decodeJwtPayload(getAccessToken()));

export const canManageEventCategoriesFromStoredToken = () =>
  isAdminRecord(getStoredCurrentUser()) || isAdminRecord(decodeJwtPayload(getAccessToken()));

export async function canCurrentUserCreateEvents() {
  const accessToken = getAccessToken();
  if (!accessToken && !getRefreshToken()) return false;

  try {
    const response = await apiFetch(endpoints.me);

    if (!response.ok) {
      return canCreateEventsFromStoredToken();
    }

    const data = await response.json().catch(() => null);
    storeCurrentUser(data);
    return canCreateEventsFromRecord(normalizeCurrentUserResponse(data));
  } catch {
    return canCreateEventsFromStoredToken();
  }
}

export async function canCurrentUserManageEventCategories() {
  const accessToken = getAccessToken();
  if (!accessToken && !getRefreshToken()) return false;

  try {
    const response = await apiFetch(endpoints.me);

    if (!response.ok) {
      return canManageEventCategoriesFromStoredToken();
    }

    const data = await response.json().catch(() => null);
    storeCurrentUser(data);
    return isAdminRecord(normalizeCurrentUserResponse(data));
  } catch {
    return canManageEventCategoriesFromStoredToken();
  }
}
