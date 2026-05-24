import { apiFetch, getAccessToken, getRefreshToken, getStoredCurrentUser, storeCurrentUser } from "./auth";
import { API_URL } from "./client";
import { endpoints } from "./endpoints";

type RawRecord = Record<string, unknown>;

export type CabinetProfile = {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  email: string;
  role: "user" | "specialist" | "admin" | string;
  profileKind: "user" | "specialist" | "admin";
  avatar: string;
  profession?: string;
  phone?: string;
  city?: string;
  education?: string;
  experience?: string;
  workHours?: string;
  about?: string;
  isVerified?: boolean;
};

export type SpecialistProfileUpdateInput = {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  specialization: string;
  education: string;
  experience: string;
  about: string;
  avatar?: File | null;
};

export type CabinetAppointment = {
  id: string;
  status: "confirmed" | "completed" | "cancelled" | string;
  specialistName: string;
  specialistAvatar: string;
  specialistRole: string;
  clientName: string;
  clientEmail: string;
  date: string;
  time: string;
  startsAt: string;
  bookAgainUrl?: string;
};

export type CabinetDocument = {
  id: string;
  title: string;
  fileUrl: string;
};

export type CabinetData = {
  profile: CabinetProfile | null;
  appointments: CabinetAppointment[];
  completedAppointments: CabinetAppointment[];
  documents: CabinetDocument[];
};

const FALLBACK_AVATAR = "/user.jpg";
const SPECIALIST_FALLBACK_AVATAR = "/lashenko2.png";

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

  const items =
    record.results ?? record.data ?? record.profiles ?? record.appointments ?? record.documents;
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

const readReferenceId = (value: unknown): string => {
  const directValue = asString(value);
  if (directValue) return directValue;

  const record = asRecord(value);
  if (!record) return "";

  return (
    readString(record, ["id", "pk", "uuid"]) ||
    readReferenceId(record.profile) ||
    readReferenceId(record.specialist_profile) ||
    readReferenceId(record.specialistProfile)
  );
};

const readSpecialistProfileId = (currentUser: RawRecord | null) => {
  if (!currentUser) return "";

  return (
    readReferenceId(currentUser.specialist_profile) ||
    readReferenceId(currentUser.specialistProfile) ||
    readReferenceId(currentUser.specialist) ||
    readReferenceId(currentUser.specialist_id) ||
    readReferenceId(currentUser.specialistProfileId)
  );
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

const fetchJson = async (url: string, signal?: AbortSignal) => {
  const response = await apiFetch(url, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json().catch(() => null);
};

const hasSpecialistProfile = (currentUser: RawRecord | null) => {
  if (currentUser?.is_verified === true || currentUser?.isVerified === true) return true;
  if (readSpecialistProfileId(currentUser)) return true;

  const profile =
    currentUser?.specialist_profile ??
    currentUser?.specialistProfile ??
    currentUser?.specialist ??
    currentUser?.specialist_id ??
    currentUser?.specialistProfileId;

  if (profile === null || profile === undefined || profile === false) return false;
  if (typeof profile === "number") return profile > 0;
  if (typeof profile === "string") return profile.trim().length > 0;
  return typeof profile === "object";
};

const getProfileKind = (
  currentUser: RawRecord | null,
  specialistProfile: RawRecord | null,
): CabinetProfile["profileKind"] => {
  if (
    currentUser?.is_staff === true ||
    currentUser?.is_superuser === true ||
    currentUser?.staff === true
  ) {
    return "admin";
  }

  const role = readString(currentUser, ["role"]).toLowerCase();
  if (specialistProfile || hasSpecialistProfile(currentUser) || role.includes("specialist")) {
    return "specialist";
  }

  return "user";
};

const normalizeProfile = (
  currentUser: RawRecord | null,
  userProfile: RawRecord | null,
  specialistProfile: RawRecord | null,
): CabinetProfile => {
  const profileKind = getProfileKind(currentUser, specialistProfile);
  const sourceProfile = profileKind === "specialist" ? specialistProfile : userProfile;
  const userFromProfile = asRecord(sourceProfile?.user);
  const source = sourceProfile || currentUser || {};
  const sourceUser = userFromProfile || asRecord(source.user) || currentUser;
  const specialistProfileId =
    profileKind === "specialist" ? readString(sourceProfile, ["id"]) || readSpecialistProfileId(currentUser) : "";

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
    profileKind;
  const profession =
    readString(source, [
      "specialization",
      "specialisation",
      "specialization_ua",
      "specialisation_ua",
      "profession",
      "position",
      "role_ua",
      "role",
      "qualification",
      "specialty",
      "speciality",
      "bio_short",
    ]) ||
    readString(source, ["about", "bio", "description"])
      .split(/\r?\n/)
      .map((item) => item.trim())
      .find(Boolean) ||
    "";

  return {
    id:
      specialistProfileId ||
      readString(source, ["id"]) ||
      readString(sourceUser, ["id"]) ||
      "me",
    firstName,
    lastName,
    fullName: directName || [firstName, lastName].filter(Boolean).join(" ") || email || "Profile",
    email,
    role,
    profileKind,
    avatar: resolveMediaUrl(
      source.avatar ??
        source.photo ??
        source.image ??
        source.picture ??
        source.avatar_url ??
        sourceUser?.avatar,
      profileKind === "specialist" ? SPECIALIST_FALLBACK_AVATAR : FALLBACK_AVATAR,
    ),
    profession,
    phone: readString(source, ["phone", "telephone", "tel", "phone_number", "phoneNumber"]),
    city: readString(source, ["city", "location", "town"]),
    education: readString(source, ["education", "degree"]),
    experience: readString(source, [
      "work_experience",
      "workExperience",
      "experience",
      "years_of_experience",
      "yearsOfExperience",
    ]),
    workHours: readString(source, [
      "work_hours",
      "workHours",
      "schedule",
      "working_hours",
      "workingHours",
    ]),
    about: readString(source, ["about", "bio", "description"]),
    isVerified:
      source.is_verified === true ||
      source.isVerified === true ||
      currentUser?.is_verified === true ||
      currentUser?.isVerified === true,
  };
};

const normalizeDocument = (raw: RawRecord): CabinetDocument => {
  const fileRecord = asRecord(raw.file) || asRecord(raw.document);
  const title =
    readString(raw, ["title", "name", "filename", "file_name", "fileName"]) ||
    readString(fileRecord, ["title", "name", "filename", "file_name", "fileName"]) ||
    "Document";
  const nestedFileValue = readString(fileRecord, [
    "url",
    "file",
    "document",
    "file_url",
    "fileUrl",
    "path",
  ]);
  const fileValue =
    nestedFileValue ||
    raw.file ||
    raw.document ||
    raw.url ||
    raw.file_url ||
    raw.fileUrl ||
    raw.document_url ||
    raw.documentUrl ||
    raw.path;

  return {
    id: readString(raw, ["id"]) || title,
    title,
    fileUrl: resolveMediaUrl(fileValue, ""),
  };
};

const matchesCurrentUser = (profile: RawRecord, currentUser: RawRecord | null) => {
  if (!currentUser) return true;

  const currentId = readString(currentUser, ["id"]);
  const currentEmail = readString(currentUser, ["email"]);
  const profileUser = asRecord(profile.user);
  const currentSpecialistId = readSpecialistProfileId(currentUser);

  return (
    !currentId ||
    (!!currentSpecialistId && readString(profile, ["id"]) === currentSpecialistId) ||
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
  const user = asRecord(raw.user) || asRecord(raw.client) || asRecord(raw.patient);
  const userProfile = asRecord(user?.profile) || asRecord(raw.profile) || asRecord(raw.user_profile);
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
  const clientName =
    readString(raw, ["user_full_name", "client_full_name", "clientName", "user_name"]) ||
    readString(userProfile, ["full_name", "fullName", "name"]) ||
    [
      readString(userProfile, ["first_name", "firstName"]),
      readString(userProfile, ["last_name", "lastName"]),
    ]
      .filter(Boolean)
      .join(" ") ||
    readString(user, ["full_name", "fullName", "name", "email"]) ||
    readString(raw, ["user_email", "client_email"]);

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
    clientName,
    clientEmail:
      readString(raw, ["user_email", "client_email", "email"]) ||
      readString(user, ["email"]),
    date: readString(raw, ["date"]) || readString(slot, ["date"]) || parsed.date,
    time: readString(raw, ["time"]) || readString(slot, ["time"]) || parsed.time,
    startsAt: startValue || `${readString(raw, ["date"]) || readString(slot, ["date"]) || parsed.date}T${readString(raw, ["time"]) || readString(slot, ["time"]) || parsed.time}`,
    bookAgainUrl: readString(raw, ["book_again_url", "bookAgainUrl"]),
  };
};

export async function getUserCabinetData(signal?: AbortSignal): Promise<CabinetData> {
  const token = getAccessToken();
  const refreshToken = getRefreshToken();
  if (!token && !refreshToken) {
    return {
      profile: null,
      appointments: [],
      completedAppointments: [],
      documents: [],
    };
  }

  const storedUser = getStoredCurrentUser();
  let currentUser = storedUser;
  let userProfile: RawRecord | null = null;
  let specialistProfile: RawRecord | null = null;

  try {
    currentUser = asRecord(await fetchJson(endpoints.me, signal)) || storedUser;
    if (currentUser) storeCurrentUser(currentUser);
  } catch {
    currentUser = getStoredCurrentUser();
  }

  try {
    const profiles = extractList(await fetchJson(endpoints.userProfiles, signal));
    userProfile =
      profiles.find((profile) => matchesCurrentUser(profile, currentUser)) ||
      (!currentUser ? profiles[0] : null) ||
      null;
  } catch {
    userProfile = null;
  }

  try {
    const directSpecialist = asRecord(
      currentUser?.specialist_profile ?? currentUser?.specialistProfile,
    );
    const directSpecialistId = readSpecialistProfileId(currentUser);

    if (directSpecialist) {
      specialistProfile = directSpecialist;
    } else if (directSpecialistId) {
      try {
        specialistProfile = asRecord(
          await fetchJson(endpoints.specialistProfile(directSpecialistId), signal),
        );
      } catch {
        const profiles = extractList(await fetchJson(endpoints.specialists, signal));
        specialistProfile = profiles.find((profile) => matchesCurrentUser(profile, currentUser)) || null;
      }
    }

    if (!specialistProfile && !directSpecialistId) {
      const profiles = extractList(await fetchJson(endpoints.specialists, signal));
      specialistProfile = profiles.find((profile) => matchesCurrentUser(profile, currentUser)) || null;
    }
  } catch {
    specialistProfile = null;
  }

  if (!getAccessToken() && !currentUser && !userProfile && !specialistProfile) {
    return {
      profile: null,
      appointments: [],
      completedAppointments: [],
      documents: [],
    };
  }

  const [appointments, completedAppointments, documents] = await Promise.all([
    fetchJson(`${endpoints.consultationAppointments}?sort_field=date&sort_direction=asc`, signal)
      .then((data) => extractList(data).map((item) => normalizeAppointment(item, "confirmed")))
      .catch(() => []),
    fetchJson(`${endpoints.consultationCompletedAppointments}?sort_direction=desc`, signal)
      .then((data) => extractList(data).map((item) => normalizeAppointment(item, "completed")))
      .catch(() => []),
    fetchJson(endpoints.documents, signal)
      .then((data) => extractList(data).map(normalizeDocument))
      .catch(() => []),
  ]);

  return {
    profile: normalizeProfile(currentUser, userProfile, specialistProfile),
    appointments,
    completedAppointments,
    documents,
  };
}

export async function updateSpecialistProfile(
  profileId: string,
  input: SpecialistProfileUpdateInput,
) {
  const token = getAccessToken();
  if (!token && !getRefreshToken()) {
    throw new Error("Authentication required");
  }

  const createBody = (avatarField = "avatar") => {
    const body = new FormData();
    body.append("first_name", input.firstName);
    body.append("last_name", input.lastName);
    body.append("phone", input.phone);
    body.append("city", input.city);
    body.append("specialization", input.specialization);
    body.append("education", input.education);
    body.append("work_experience", input.experience);
    body.append("about", input.about);

    if (input.avatar) {
      body.append(avatarField, input.avatar);
    }

    return body;
  };

  const sendUpdate = (avatarField = "avatar") =>
    apiFetch(endpoints.specialistProfile(profileId), {
      method: "PATCH",
      body: createBody(avatarField),
    });

  let response = await sendUpdate();

  if (!response.ok && input.avatar && response.status === 400) {
    for (const avatarField of ["photo", "image", "picture"]) {
      response = await sendUpdate(avatarField);
      if (response.ok) break;
    }
  }

  if (!response.ok) {
    const details = await response
      .json()
      .then((data) => JSON.stringify(data))
      .catch(() => "");
    throw new Error(`Profile update failed: ${response.status}${details ? ` ${details}` : ""}`);
  }

  return response.json().catch(() => null);
}

export async function updateProfileAvatar(profile: CabinetProfile, avatar: File) {
  const token = getAccessToken();
  if (!token && !getRefreshToken()) {
    throw new Error("Authentication required");
  }

  const endpoint =
    profile.profileKind === "specialist"
      ? endpoints.specialistProfile(profile.id)
      : `${endpoints.userProfiles}${profile.id}/`;

  const uploadWithField = (fieldName: "avatar" | "photo" | "image" | "picture") => {
    const body = new FormData();
    body.append(fieldName, avatar);

    return apiFetch(endpoint, {
      method: "PATCH",
      body,
    });
  };

  let response = await uploadWithField("avatar");

  if (!response.ok && response.status === 400) {
    for (const fieldName of ["photo", "image", "picture"] as const) {
      response = await uploadWithField(fieldName);
      if (response.ok) break;
    }
  }

  if (!response.ok) {
    const details = await response
      .json()
      .then((data) => JSON.stringify(data))
      .catch(() => "");
    throw new Error(`Avatar update failed: ${response.status}${details ? ` ${details}` : ""}`);
  }

  return response.json().catch(() => null);
}

export async function uploadSpecialistDocuments(files: File[]) {
  const token = getAccessToken();
  if ((!token && !getRefreshToken()) || files.length === 0) return [];
  const filesToUpload = files.slice(0, 3);

  const uploadWithField = async (file: File, fieldName: "file" | "document") => {
    const body = new FormData();
    body.append(fieldName, file);
    body.append("title", file.name);

    return apiFetch(endpoints.documents, {
      method: "POST",
      body,
    });
  };

  const results = [];

  for (const file of filesToUpload) {
    let response = await uploadWithField(file, "file");

    if (!response.ok && response.status === 400) {
      response = await uploadWithField(file, "document");
    }

    if (!response.ok) {
      throw new Error(`Document upload failed: ${response.status}`);
    }

    results.push(await response.json().catch(() => null));
  }

  return results;
}
