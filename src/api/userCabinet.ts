import { getAccessToken, getStoredCurrentUser, storeCurrentUser } from "./auth";
import { API_URL } from "./client";
import { endpoints } from "./endpoints";

type RawRecord = Record<string, unknown>;

export type CabinetProfile = {
  id: string;
  fullName: string;
  email: string;
  role: "user" | "specialist" | "admin" | string;
  avatar: string;
  workHours?: string;
  about?: string;
};

export type CabinetAppointment = {
  id: string;
  status: "confirmed" | "completed" | "cancelled" | string;
  specialistName: string;
  specialistAvatar: string;
  specialistRole: string;
  date: string;
  time: string;
  bookAgainUrl?: string;
};

export type CabinetData = {
  profile: CabinetProfile | null;
  appointments: CabinetAppointment[];
  completedAppointments: CabinetAppointment[];
};

const FALLBACK_AVATAR = "/user.jpg";

const asRecord = (value: unknown): RawRecord | null =>
  value && typeof value === "object" ? (value as RawRecord) : null;

const asString = (value: unknown, fallback = "") => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
};

const extractList = (data: unknown): RawRecord[] => {
  if (Array.isArray(data)) return data.filter((item) => asRecord(item));

  const record = asRecord(data);
  if (!record) return [];

  const items = record.results ?? record.data ?? record.profiles ?? record.appointments;
  return Array.isArray(items) ? items.filter((item) => asRecord(item)) : [];
};

const readString = (record: RawRecord | null, keys: string[]) => {
  if (!record) return "";

  for (const key of keys) {
    if (key.includes(".")) {
      const [parentKey, childKey] = key.split(".");
      const nested = asRecord(record[parentKey]);
      const value = asString(nested?.[childKey]);
      if (value) return value;
      continue;
    }

    const value = asString(record[key]);
    if (value) return value;
  }

  return "";
};

const getApiOrigin = () => {
  try {
    return API_URL ? new URL(API_URL).origin : "";
  } catch {
    return "";
  }
};

const resolveMediaUrl = (value: unknown, fallback = FALLBACK_AVATAR) => {
  const path = asString(value);
  if (!path) return fallback;
  if (/^https?:\/\//i.test(path)) return path;

  const apiOrigin = getApiOrigin();
  if (apiOrigin && (path.startsWith("/media") || path.startsWith("/uploads"))) {
    return `${apiOrigin}${path}`;
  }

  return path.startsWith("/") ? path : apiOrigin ? new URL(path, `${apiOrigin}/`).toString() : path;
};

const authHeaders = (): Record<string, string> => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const fetchJson = async (url: string, signal?: AbortSignal) => {
  const response = await fetch(url, {
    headers: authHeaders(),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json().catch(() => null);
};

const normalizeProfile = (currentUser: RawRecord | null, userProfile: RawRecord | null): CabinetProfile => {
  const userFromProfile = asRecord(userProfile?.user);
  const source = userProfile || currentUser || {};
  const sourceUser = userFromProfile || asRecord(source.user) || currentUser;

  const firstName =
    readString(source, ["first_name", "firstName"]) ||
    readString(sourceUser, ["first_name", "firstName"]);
  const lastName =
    readString(source, ["last_name", "lastName"]) ||
    readString(sourceUser, ["last_name", "lastName"]);
  const directName =
    readString(source, ["full_name", "fullName", "name"]) ||
    readString(sourceUser, ["full_name", "fullName", "name"]);
  const email =
    readString(source, ["email", "user.email"]) ||
    readString(sourceUser, ["email"]) ||
    readString(currentUser, ["email"]);
  const role =
    readString(currentUser, ["role"]) ||
    readString(sourceUser, ["role"]) ||
    readString(source, ["role"]) ||
    "user";

  return {
    id: readString(source, ["id"]) || readString(sourceUser, ["id"]) || "me",
    fullName: directName || [firstName, lastName].filter(Boolean).join(" ") || email || "Profile",
    email,
    role,
    avatar: resolveMediaUrl(
      source.avatar ??
        source.photo ??
        source.image ??
        source.picture ??
        source.avatar_url ??
        sourceUser?.avatar,
    ),
    workHours: readString(source, [
      "work_hours",
      "workHours",
      "schedule",
      "working_hours",
      "workingHours",
    ]),
    about: readString(source, ["about", "bio", "description"]),
  };
};

const matchesCurrentUser = (profile: RawRecord, currentUser: RawRecord | null) => {
  if (!currentUser) return true;

  const currentId = readString(currentUser, ["id"]);
  const currentEmail = readString(currentUser, ["email"]);
  const profileUser = asRecord(profile.user);

  return (
    !currentId ||
    readString(profile, ["user", "user_id", "userId"]) === currentId ||
    readString(profileUser, ["id"]) === currentId ||
    (!!currentEmail && readString(profileUser, ["email"]) === currentEmail)
  );
};

const parseDateTime = (rawValue: string) => {
  if (!rawValue) return { date: "", time: "" };

  const normalizedValue = rawValue.includes("T") ? rawValue : rawValue.replace(" ", "T");
  const parsed = new Date(normalizedValue);

  if (Number.isNaN(parsed.getTime())) {
    const [date = "", time = ""] = rawValue.split(/[T ]/);
    return { date, time: time.slice(0, 5) };
  }

  return {
    date: parsed.toLocaleDateString("uk-UA"),
    time: parsed.toLocaleTimeString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

const normalizeAppointment = (
  raw: RawRecord,
  fallbackStatus: CabinetAppointment["status"],
): CabinetAppointment => {
  const slot = asRecord(raw.slot);
  const specialist = asRecord(raw.specialist) || asRecord(slot?.specialist);
  const startValue = readString(raw, [
    "start_time",
    "startTime",
    "starts_at",
    "startsAt",
    "datetime",
    "date_time",
  ]) || readString(slot, ["start_time", "startTime", "starts_at", "startsAt", "datetime"]);
  const parsed = parseDateTime(startValue);
  const specialistName =
    readString(raw, ["specialist_full_name", "specialistName", "specialist_name"]) ||
    readString(specialist, ["full_name", "fullName", "name"]) ||
    [
      readString(specialist, ["first_name", "firstName"]),
      readString(specialist, ["last_name", "lastName"]),
    ]
      .filter(Boolean)
      .join(" ");

  return {
    id: readString(raw, ["id"]) || `${parsed.date}-${parsed.time}`,
    status: readString(raw, ["status"]) || fallbackStatus,
    specialistName,
    specialistAvatar: resolveMediaUrl(
      raw.specialist_avatar ??
        raw.specialistAvatar ??
        raw.specialist_photo ??
        raw.specialistPhoto ??
        specialist?.avatar ??
        specialist?.photo ??
        specialist?.image,
      "/lashenko2.png",
    ),
    specialistRole:
      readString(raw, ["specialist_role", "specialistRole"]) ||
      readString(specialist, ["specialization", "specialisation", "role", "position"]),
    date: readString(raw, ["date"]) || readString(slot, ["date"]) || parsed.date,
    time: readString(raw, ["time"]) || readString(slot, ["time"]) || parsed.time,
    bookAgainUrl: readString(raw, ["book_again_url", "bookAgainUrl"]),
  };
};

export async function getUserCabinetData(signal?: AbortSignal): Promise<CabinetData> {
  const token = getAccessToken();
  if (!token) {
    return {
      profile: null,
      appointments: [],
      completedAppointments: [],
    };
  }

  const storedUser = getStoredCurrentUser();
  let currentUser = storedUser;
  let userProfile: RawRecord | null = null;

  try {
    currentUser = asRecord(await fetchJson(endpoints.me, signal)) || storedUser;
    if (currentUser) storeCurrentUser(currentUser);
  } catch {
    currentUser = storedUser;
  }

  try {
    const profiles = extractList(await fetchJson(endpoints.userProfiles, signal));
    userProfile = profiles.find((profile) => matchesCurrentUser(profile, currentUser)) || profiles[0] || null;
  } catch {
    userProfile = null;
  }

  const [appointments, completedAppointments] = await Promise.all([
    fetchJson(`${endpoints.consultationAppointments}?sort_field=date&sort_direction=asc`, signal)
      .then((data) => extractList(data).map((item) => normalizeAppointment(item, "confirmed")))
      .catch(() => []),
    fetchJson(`${endpoints.consultationCompletedAppointments}?sort_direction=desc`, signal)
      .then((data) => extractList(data).map((item) => normalizeAppointment(item, "completed")))
      .catch(() => []),
  ]);

  return {
    profile: normalizeProfile(currentUser, userProfile),
    appointments,
    completedAppointments,
  };
}
