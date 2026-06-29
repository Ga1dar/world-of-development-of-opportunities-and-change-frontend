import {
  apiFetch,
  getAccessToken,
  getRefreshToken,
  getStoredCurrentUser,
  normalizeCurrentUserResponse,
  storeCurrentUser,
} from "./auth";
import { API_URL } from "./client";
import { endpoints } from "./endpoints";

type RawRecord = Record<string, unknown>;

export type CabinetProfile = {
  id: string;
  userProfileId?: string;
  specialistProfileId?: string;
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
  birthDate?: string;
  gender?: string;
  education?: string;
  hasChildren?: string;
  experience?: string;
  educationOther?: string;
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

export type SpecialistProfileCreateInput = SpecialistProfileUpdateInput & {
  acceptDataProcessingConsent: boolean;
};

export type UserProfileUpdateInput = {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  birthDate: string;
  gender?: string;
  education?: string;
  educationOther?: string;
  hasChildren?: string;
  about: string;
};

export type UserProfileCreateInput = UserProfileUpdateInput & {
  acceptDataProcessingConsent: boolean;
  avatar?: File | null;
};

export type UserOnboardingProfileCreateInput = UserProfileCreateInput;

export type CabinetAppointment = {
  id: string;
  status: "confirmed" | "completed" | "cancelled" | string;
  specialistId?: string;
  specialistName: string;
  specialistAvatar: string;
  specialistRole: string;
  clientId: string;
  clientProfileId: string;
  clientName: string;
  clientEmail: string;
  clientAvatar: string;
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

export type CabinetAppointmentQuery = {
  user?: string;
  date?: string;
  completed?: boolean;
  sortDirection?: "asc" | "desc";
};

const FALLBACK_AVATAR = "/user.jpg";
const SPECIALIST_FALLBACK_AVATAR = "/lashenko2.png";
export const PROFILE_AVATAR_CHANGED_EVENT = "profile-avatar-changed";
let profileAvatarVersion = "";

const asRecord = (value: unknown): RawRecord | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as RawRecord)
    : null;

const asString = (value: unknown, fallback = "") => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
};

const PHONE_COUNTRY_CODES = ["380", "420", "49", "48", "1"] as const;

const normalizeNationalPhoneDigits = (countryCode: string, nationalNumber: string) => {
  if (countryCode === "380" || countryCode === "49") {
    return nationalNumber.replace(/^0+/, "");
  }

  return nationalNumber;
};

const normalizePhoneForSubmit = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "";

  if (trimmedValue.startsWith("+")) {
    const digits = trimmedValue.replace(/\D/g, "");
    const countryCode = PHONE_COUNTRY_CODES.find((code) => digits.startsWith(code));

    if (!countryCode) {
      return digits ? `+${digits}` : "";
    }

    const nationalNumber = normalizeNationalPhoneDigits(
      countryCode,
      digits.slice(countryCode.length),
    );

    return nationalNumber ? `+${countryCode}${nationalNumber}` : "";
  }

  const digits = trimmedValue.replace(/\D/g, "");
  const nationalNumber = normalizeNationalPhoneDigits("380", digits);
  return nationalNumber ? `+380${nationalNumber}` : "";
};

const normalizeBooleanChoiceForSubmit = (value?: string) => {
  const cleanValue = (value || "").trim().toLowerCase();
  if (!cleanValue) return "";
  if (["yes", "true", "1", "так", "та"].includes(cleanValue)) return "true";
  if (["no", "false", "0", "ні", "нi"].includes(cleanValue)) return "false";
  return cleanValue;
};

const normalizeChoiceKey = (value?: string) =>
  (value || "").trim().toLowerCase().replace(/\s+/g, " ");

const normalizeEducationForSubmit = (value?: string) => {
  const cleanValue = normalizeChoiceKey(value);
  if (!cleanValue) return "";

  if (
    [
      "teacher",
      "pedagogue",
      "педагог",
      "педагог/педагогиня",
      "педагогиня",
    ].includes(cleanValue)
  ) {
    return "teacher";
  }

  if (
    [
      "psychologist",
      "psychology",
      "психолог",
      "психолог/психологиня",
      "психологиня",
    ].includes(cleanValue)
  ) {
    return "psychologist";
  }

  if (
    [
      "trauma_pedagogy",
      "trauma pedagogy",
      "trauma pedagogue",
      "травмопедагог",
      "травмопедагог/травмопедагогиня",
      "травмопедагогиня",
    ].includes(cleanValue)
  ) {
    return "trauma_pedagogy";
  }

  if (
    [
      "other",
      "other education",
      "інша освіта",
      "інша освіта (вказати)",
      "інше",
    ].includes(cleanValue)
  ) {
    return "other";
  }

  return "other";
};

const appendOptionalUserProfileFields = (
  body: FormData,
  input: Pick<UserProfileUpdateInput, "gender" | "education" | "educationOther" | "hasChildren">,
) => {
  if (input.gender) {
    body.append("gender", input.gender);
  }

  if (input.education) {
    const education = normalizeEducationForSubmit(input.education);
    body.append("education", education);

    if (education === "other") {
      const educationOther = (input.educationOther || input.education).trim();
      if (educationOther) {
        body.append("education_other", educationOther);
      }
    }
  }

  const hasChildren = normalizeBooleanChoiceForSubmit(input.hasChildren);
  if (hasChildren) {
    body.append("has_children", hasChildren);
  }
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

const parseJsonResponse = (response: Response) => response.json().catch(() => null);

const stringifyResponseDetails = (data: unknown) => {
  const record = asRecord(data);
  if (!record) return "";

  return JSON.stringify(record);
};

const hasEducationOtherValidationError = (data: unknown) => {
  const record = asRecord(data);
  if (!record) return false;

  return (
    Object.prototype.hasOwnProperty.call(record, "education_other") ||
    Object.prototype.hasOwnProperty.call(record, "educationOther")
  );
};

const readReferenceId = (value: unknown): string => {
  const directValue = asString(value);
  if (directValue) return directValue;

  const record = asRecord(value);
  if (!record) return "";

  return (
    readString(record, [
      "id",
      "pk",
      "uuid",
      "profile_id",
      "profileId",
      "user_profile_id",
      "userProfileId",
      "specialist_profile_id",
      "specialistProfileId",
    ]) ||
    readReferenceId(record.profile) ||
    readReferenceId(record.user_profile) ||
    readReferenceId(record.userProfile) ||
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
    readReferenceId(currentUser.specialist_profile_id) ||
    readReferenceId(currentUser.specialist_id) ||
    readReferenceId(currentUser.specialistProfileId) ||
    (readString(currentUser, ["role"]).toLowerCase().includes("specialist")
      ? readReferenceId(currentUser.profile_id) || readReferenceId(currentUser.profileId)
      : "")
  );
};

const readUserProfileId = (currentUser: RawRecord | null) => {
  if (!currentUser) return "";

  return (
    readReferenceId(currentUser.user_profile) ||
    readReferenceId(currentUser.userProfile) ||
    readReferenceId(currentUser.profile) ||
    readReferenceId(currentUser.profile_id) ||
    readReferenceId(currentUser.profileId) ||
    readReferenceId(currentUser.user_profile_id) ||
    readReferenceId(currentUser.userProfileId)
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

const withAvatarVersion = (url: string) => {
  if (!url || !profileAvatarVersion || url === FALLBACK_AVATAR || url === SPECIALIST_FALLBACK_AVATAR) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${profileAvatarVersion}`;
};

const resolveProfileAvatar = (value: unknown, fallback: string) =>
  withAvatarVersion(resolveMediaUrl(value, fallback));

const readMediaValue = (...values: unknown[]): unknown => {
  for (const value of values) {
    const directValue = asString(value);
    if (directValue) return directValue;

    const record = asRecord(value);
    if (!record) continue;

    const nestedValue =
      readString(record, [
        "url",
        "secure_url",
        "download_url",
        "file",
        "src",
        "href",
        "path",
        "avatar",
        "avatar_url",
        "avatarUrl",
        "photo",
        "photo_url",
        "photoUrl",
        "image",
        "image_url",
        "imageUrl",
        "picture",
        "profile_photo",
        "profilePhoto",
        "profile_photo_url",
        "profilePhotoUrl",
        "profile_image",
        "profileImage",
        "profile_image_url",
        "profileImageUrl",
        "profile_picture",
        "profilePicture",
        "thumbnail",
        "thumbnail_url",
        "thumbnailUrl",
      ]) ||
      readMediaValue(
        record.file,
        record.image,
        record.photo,
        record.avatar,
        record.picture,
        record.profile_photo,
        record.profilePhoto,
        record.profile_image,
        record.profileImage,
        record.profile_picture,
        record.profilePicture,
        record.user,
        record.profile,
        record.user_profile,
        record.userProfile,
        record.client,
        record.patient,
        record.owner,
        record.account,
      );

    if (nestedValue) return nestedValue;
  }

  return "";
};

const readAvatarValue = (profile: RawRecord | null, user: RawRecord | null = null) =>
  readMediaValue(
    profile?.avatar,
    profile?.photo,
    profile?.image,
    profile?.picture,
    profile?.file,
    profile?.avatar_url,
    profile?.avatarUrl,
    profile?.photo_url,
    profile?.photoUrl,
    profile?.image_url,
    profile?.imageUrl,
    profile?.profile_photo,
    profile?.profilePhoto,
    profile?.profile_image,
    profile?.profileImage,
    profile?.avatar_image,
    profile?.avatarImage,
    profile?.image_file,
    profile?.imageFile,
    user?.avatar,
    user?.photo,
    user?.image,
    user?.picture,
    user?.file,
    user?.avatar_url,
    user?.avatarUrl,
    user?.photo_url,
    user?.photoUrl,
    user?.image_url,
    user?.imageUrl,
    user?.profile_photo,
    user?.profilePhoto,
    user?.profile_image,
    user?.profileImage,
    user?.avatar_image,
    user?.avatarImage,
    user?.image_file,
    user?.imageFile,
  );

const readAvatarFromResponse = (data: unknown) => {
  const response = asRecord(data);
  const profile =
    asRecord(response?.data) ||
    asRecord(response?.profile) ||
    asRecord(response?.user_profile) ||
    asRecord(response?.specialist_profile) ||
    response;
  const user = asRecord(profile?.user);

  return resolveProfileAvatar(readAvatarValue(profile, user), "");
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
    profileKind === "specialist"
      ? readReferenceId(sourceProfile) || readSpecialistProfileId(currentUser)
      : "";
  const userProfileId =
    profileKind !== "specialist"
      ? readReferenceId(userProfile) || readUserProfileId(currentUser)
      : "";

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
    readString(source, ["email", "user_email", "userEmail", "user.email"]) ||
    readString(sourceUser, ["email", "user_email", "userEmail"]) ||
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
      userProfileId ||
      readString(source, ["id"]) ||
      readString(sourceUser, ["id"]) ||
      "me",
    userProfileId,
    specialistProfileId,
    firstName,
    lastName,
    fullName: directName || [firstName, lastName].filter(Boolean).join(" ") || email || "Profile",
    email,
    role,
    profileKind,
    avatar: resolveProfileAvatar(
      readAvatarValue(source, sourceUser),
      profileKind === "specialist" ? SPECIALIST_FALLBACK_AVATAR : FALLBACK_AVATAR,
    ),
    profession,
    phone:
      readString(source, ["phone", "telephone", "tel", "phone_number", "phoneNumber"]) ||
      readString(sourceUser, ["phone", "telephone", "tel", "phone_number", "phoneNumber"]),
    city:
      readString(source, ["city", "location", "town"]) ||
      readString(sourceUser, ["city", "location", "town"]),
    birthDate:
      readString(source, ["birth_date", "birthDate", "date_of_birth", "dateOfBirth", "birthday", "dob"]) ||
      readString(sourceUser, ["birth_date", "birthDate", "date_of_birth", "dateOfBirth", "birthday", "dob"]),
    gender:
      readString(source, ["gender", "sex"]) ||
      readString(sourceUser, ["gender", "sex"]),
    education:
      readString(source, ["education", "degree"]) ||
      readString(sourceUser, ["education", "degree"]),
    educationOther:
      readString(source, ["education_other", "educationOther", "other_education", "otherEducation"]) ||
      readString(sourceUser, ["education_other", "educationOther", "other_education", "otherEducation"]),
    hasChildren:
      readString(source, ["has_children", "hasChildren", "children", "raising_children", "raisingChildren"]) ||
      readString(sourceUser, ["has_children", "hasChildren", "children", "raising_children", "raisingChildren"]),
    experience:
      readString(source, [
        "work_experience",
        "workExperience",
        "experience",
        "experience_ua",
        "experience_en",
        "years_of_experience",
        "yearsOfExperience",
      ]) ||
      readString(sourceUser, [
        "work_experience",
        "workExperience",
        "experience",
        "experience_ua",
        "experience_en",
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
    about:
      readString(source, ["about", "bio", "description"]) ||
      readString(sourceUser, ["about", "bio", "description"]),
    isVerified:
      source.is_verified === true ||
      source.isVerified === true ||
      currentUser?.is_verified === true ||
      currentUser?.isVerified === true,
  };
};

const normalizeDocument = (raw: RawRecord): CabinetDocument => {
  const fileRecord = asRecord(raw.file) || asRecord(raw.document);
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
  const fileUrl = resolveMediaUrl(fileValue, "");
  const fileNameFromUrl = (() => {
    if (!fileUrl) return "";

    try {
      const pathname = new URL(fileUrl, window.location.origin).pathname;
      return decodeURIComponent(pathname.split("/").filter(Boolean).pop() || "");
    } catch {
      return "";
    }
  })();
  const title =
    readString(raw, ["title", "name", "filename", "file_name", "fileName"]) ||
    readString(fileRecord, ["title", "name", "filename", "file_name", "fileName"]) ||
    fileNameFromUrl ||
    "Document";

  return {
    id: readString(raw, ["id"]) || title,
    title,
    fileUrl,
  };
};

const matchesCurrentUser = (profile: RawRecord, currentUser: RawRecord | null) => {
  if (!currentUser) return true;

  const currentId = readString(currentUser, ["id", "user_id", "userId"]);
  const currentEmail = readString(currentUser, ["email", "user_email", "userEmail"]);
  const currentUsername = readString(currentUser, ["username"]);
  const profileUser =
    asRecord(profile.user) ||
    asRecord(profile.owner) ||
    asRecord(profile.account) ||
    asRecord(profile.user_details) ||
    asRecord(profile.userDetails);
  const currentSpecialistId = readSpecialistProfileId(currentUser);
  const profileUserId =
    readString(profile, [
      "user",
      "user_id",
      "userId",
      "owner",
      "owner_id",
      "ownerId",
      "account",
      "account_id",
      "accountId",
    ]) || readString(profileUser, ["id", "user_id", "userId"]);
  const profileEmail =
    readString(profile, [
      "user_email",
      "userEmail",
      "email",
      "owner_email",
      "ownerEmail",
      "account_email",
      "accountEmail",
    ]) || readString(profileUser, ["email", "user_email", "userEmail"]);
  const profileUsername =
    readString(profile, ["username", "user_username", "userUsername"]) ||
    readString(profileUser, ["username"]);

  return (
    !currentId ||
    (!!currentSpecialistId && readString(profile, ["id"]) === currentSpecialistId) ||
    profileUserId === currentId ||
    (!!currentEmail && profileEmail.toLowerCase() === currentEmail.toLowerCase()) ||
    (!!currentUsername && profileUsername === currentUsername)
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

const readSpecialistIdFromBookAgainUrl = (value: string) => {
  if (!value) return "";

  try {
    return new URL(value, API_URL).searchParams.get("specialist") || "";
  } catch {
    const match = value.match(/[?&]specialist=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }
};

const readSpecialistReferenceId = (...values: unknown[]) => {
  for (const value of values) {
    const directId = readReferenceId(value);
    if (directId) return directId;

    const record = asRecord(value);
    if (!record) continue;

    const nestedId =
      readString(record, [
        "specialist_id",
        "specialistId",
        "specialist_profile_id",
        "specialistProfileId",
        "psychologist_id",
        "psychologistId",
        "doctor_id",
        "doctorId",
        "provider_id",
        "providerId",
      ]) ||
      readReferenceId(record.specialist) ||
      readReferenceId(record.specialist_profile) ||
      readReferenceId(record.specialistProfile) ||
      readReferenceId(record.psychologist) ||
      readReferenceId(record.doctor) ||
      readReferenceId(record.provider);

    if (nestedId) return nestedId;
  }

  return "";
};

const readAppointmentClientId = (
  raw: RawRecord,
  user: RawRecord | null,
  profile: RawRecord | null,
) =>
  readReferenceId(raw.user) ||
  readReferenceId(raw.client) ||
  readReferenceId(raw.patient) ||
  readString(raw, [
    "user_id",
    "userId",
    "client_id",
    "clientId",
    "patient_id",
    "patientId",
  ]) ||
  readReferenceId(profile?.user) ||
  readReferenceId(user);

const readProfileUser = (profile: RawRecord | null) =>
  asRecord(profile?.user) ||
  asRecord(profile?.owner) ||
  asRecord(profile?.account) ||
  asRecord(profile?.user_details) ||
  asRecord(profile?.userDetails);

const profileBelongsToUser = (profile: RawRecord | null, user: RawRecord | null) => {
  if (!profile || !user) return false;

  const profileUser = readProfileUser(profile);
  const profileUserId =
    readReferenceId(profile.user) ||
    readReferenceId(profileUser) ||
    readString(profile, ["user_id", "userId"]);
  const userId = readReferenceId(user) || readString(user, ["id", "user_id", "userId"]);
  const profileEmail =
    readString(profile, ["email", "user_email", "userEmail"]) ||
    readString(profileUser, ["email", "user_email", "userEmail"]);
  const userEmail = readString(user, ["email", "user_email", "userEmail"]);

  return (
    (!!profileUserId && !!userId && profileUserId === userId) ||
    (!!profileEmail && !!userEmail && profileEmail.toLowerCase() === userEmail.toLowerCase())
  );
};

const readAppointmentClientProfileId = (
  raw: RawRecord,
  user: RawRecord | null,
  profile: RawRecord | null,
) =>
  readReferenceId(raw.user_profile) ||
  readReferenceId(raw.userProfile) ||
  readReferenceId(raw.client_profile) ||
  readReferenceId(raw.clientProfile) ||
  readReferenceId(raw.patient_profile) ||
  readReferenceId(raw.patientProfile) ||
  readString(raw, [
    "user_profile_id",
    "userProfileId",
    "client_profile_id",
    "clientProfileId",
    "patient_profile_id",
    "patientProfileId",
    "profile_id",
    "profileId",
  ]) ||
  readReferenceId(profile) ||
  readReferenceId(user?.profile) ||
  readReferenceId(user?.user_profile) ||
  readReferenceId(user?.userProfile);

const profileMatchesAppointmentClient = (
  profile: RawRecord,
  appointment: CabinetAppointment,
) => {
  const profileUser = readProfileUser(profile);
  const profileId = readReferenceId(profile);
  const userId =
    readReferenceId(profile.user) ||
    readReferenceId(profileUser) ||
    readString(profile, ["user_id", "userId"]);
  const email =
    readString(profile, ["email", "user_email", "userEmail"]) ||
    readString(profileUser, ["email", "user_email", "userEmail"]);
  const fullName =
    readString(profile, ["full_name", "fullName", "name"]) ||
    [readString(profile, ["first_name", "firstName"]), readString(profile, ["last_name", "lastName"])]
      .filter(Boolean)
      .join(" ");
  const appointmentName = appointment.clientName.trim().toLowerCase();
  const profileName = fullName.trim().toLowerCase();

  return (
    (!!appointment.clientProfileId && profileId === appointment.clientProfileId) ||
    (!!appointment.clientId && userId === appointment.clientId) ||
    (!!appointment.clientEmail && email.toLowerCase() === appointment.clientEmail.toLowerCase()) ||
    (!!appointmentName && profileName === appointmentName)
  );
};

const readProfileAvatar = (profile: RawRecord | null) =>
  profile ? resolveProfileAvatar(readAvatarValue(profile, readProfileUser(profile)), "") : "";

const findAppointmentClientProfile = (
  profiles: RawRecord[],
  appointment: CabinetAppointment,
) => profiles.find((item) => profileMatchesAppointmentClient(item, appointment)) || null;

const normalizeProfileDetailResponse = (data: unknown) => {
  const response = asRecord(data);

  return (
    asRecord(response?.data) ||
    asRecord(response?.profile) ||
    asRecord(response?.user_profile) ||
    asRecord(response?.userProfile) ||
    response
  );
};

const readFirstProfileFromResponse = (data: unknown) => {
  const list = extractList(data);
  if (list.length > 0) return list[0];

  return normalizeProfileDetailResponse(data);
};

const hydrateAppointmentClientAvatars = async (
  appointments: CabinetAppointment[],
  profiles: RawRecord[],
  signal?: AbortSignal,
) =>
  {
    const profileIdsToFetch = Array.from(
      new Set(
        appointments
          .map((appointment) => appointment.clientProfileId || readReferenceId(findAppointmentClientProfile(profiles, appointment)))
          .filter(Boolean),
      ),
    );
    const userIdsToFetch = Array.from(
      new Set(
        appointments
          .map((appointment) => appointment.clientId)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const [detailedProfiles, profilesByUser, profileDetailsByUserId] = await Promise.all([
      Promise.all(
        profileIdsToFetch.map((id) =>
          fetchJson(endpoints.userProfile(id), signal)
            .then(normalizeProfileDetailResponse)
            .catch(() => null),
        ),
      ),
      Promise.all(
        userIdsToFetch.map((id) =>
          fetchJson(`${endpoints.userProfiles}?user=${encodeURIComponent(id)}`, signal)
            .then(readFirstProfileFromResponse)
            .catch(() => null),
        ),
      ),
      Promise.all(
        userIdsToFetch.map((id) =>
          fetchJson(endpoints.userProfile(id), signal)
            .then(normalizeProfileDetailResponse)
            .catch(() => null),
        ),
      ),
    ]);
    const hydratedProfiles = [
      ...profiles,
      ...detailedProfiles.filter((profile): profile is RawRecord => Boolean(profile)),
      ...profilesByUser.filter((profile): profile is RawRecord => Boolean(profile)),
      ...profileDetailsByUserId.filter((profile): profile is RawRecord => Boolean(profile)),
    ];

    return appointments.map((appointment) => {
      const profile = findAppointmentClientProfile(hydratedProfiles, appointment);
      const avatar = readProfileAvatar(profile);

      if (avatar) return { ...appointment, clientAvatar: avatar };
      if (appointment.clientAvatar && appointment.clientAvatar !== FALLBACK_AVATAR) return appointment;
      return appointment;
    });
  };

const normalizeAppointmentSpecialistLookup = (value: string) =>
  value
    .replace(
      /^\s*(specialist|psychologist|doctor|provider|спеціаліст|специалист|психолог|лікар|врач)\s*[:：-]\s*/i,
      "",
    )
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const normalizeAppointmentMediaLookup = (value: string) => {
  const normalized = value.split("?")[0].replace(/\\/g, "/").toLowerCase();

  return normalized.endsWith("/user.jpg") || normalized.endsWith("/lashenko2.png")
    ? ""
    : normalized;
};

const readSpecialistProfileLookupKeys = (profile: RawRecord | null) => {
  const user = readProfileUser(profile);
  const firstNames = [
    readString(profile, ["first_name", "firstName", "first_name_ua", "first_name_en"]),
    readString(user, ["first_name", "firstName", "first_name_ua", "first_name_en"]),
  ].filter(Boolean);
  const lastNames = [
    readString(profile, ["last_name", "lastName", "last_name_ua", "last_name_en"]),
    readString(user, ["last_name", "lastName", "last_name_ua", "last_name_en"]),
  ].filter(Boolean);
  const fullNames = [
    readString(profile, [
      "full_name",
      "fullName",
      "full_name_ua",
      "full_name_en",
      "display_name",
      "displayName",
      "name",
      "name_ua",
      "name_en",
      "title",
      "username",
    ]),
    readString(user, [
      "full_name",
      "fullName",
      "full_name_ua",
      "full_name_en",
      "display_name",
      "displayName",
      "name",
      "name_ua",
      "name_en",
      "username",
    ]),
    readString(profile, ["email", "user_email", "userEmail"]),
    readString(user, ["email", "user_email", "userEmail"]),
  ];
  const nameCombinations = firstNames.flatMap((firstName) =>
    lastNames.flatMap((lastName) => [`${firstName} ${lastName}`, `${lastName} ${firstName}`]),
  );

  return [...fullNames, ...nameCombinations]
    .map(normalizeAppointmentSpecialistLookup)
    .filter((key, index, keys): key is string => Boolean(key) && keys.indexOf(key) === index);
};

const hydrateAppointmentSpecialistLinks = (
  appointments: CabinetAppointment[],
  specialistProfiles: RawRecord[],
) => {
  if (!appointments.length || !specialistProfiles.length) return appointments;

  const specialistLookup = specialistProfiles
    .map((profile) => {
      const id = readSpecialistReferenceId(profile) || readReferenceId(profile);
      if (!id) return null;

      const keys = readSpecialistProfileLookupKeys(profile);
      const avatar = normalizeAppointmentMediaLookup(readProfileAvatar(profile));

      return keys.length || avatar ? { id, keys, avatar } : null;
    })
    .filter((item): item is { id: string; keys: string[]; avatar: string } =>
      Boolean(item),
    );

  if (!specialistLookup.length) return appointments;

  return appointments.map((appointment) => {
    if (appointment.specialistId) return appointment;

    const appointmentKeys = [
      appointment.specialistName,
      appointment.specialistName.replace(/^Specialist:\s*/i, ""),
    ]
      .map(normalizeAppointmentSpecialistLookup)
      .filter((key): key is string => Boolean(key));
    const appointmentAvatar = normalizeAppointmentMediaLookup(appointment.specialistAvatar);
    const matchedSpecialist = specialistLookup.find((specialist) =>
      appointmentKeys.some((key) => specialist.keys.includes(key)) ||
      Boolean(appointmentAvatar && specialist.avatar && appointmentAvatar === specialist.avatar),
    );

    return matchedSpecialist
      ? { ...appointment, specialistId: matchedSpecialist.id }
      : appointment;
  });
};

const normalizeAppointment = (
  raw: RawRecord,
  fallbackStatus: CabinetAppointment["status"],
): CabinetAppointment => {
  const slot = asRecord(raw.slot);
  const specialist =
    asRecord(raw.specialist) ||
    asRecord(raw.specialist_profile) ||
    asRecord(raw.specialistProfile) ||
    asRecord(raw.psychologist) ||
    asRecord(raw.doctor) ||
    asRecord(raw.provider) ||
    asRecord(slot?.specialist) ||
    asRecord(slot?.specialist_profile) ||
    asRecord(slot?.specialistProfile) ||
    asRecord(slot?.psychologist) ||
    asRecord(slot?.doctor) ||
    asRecord(slot?.provider);
  const rawUser = asRecord(raw.user);
  const client = asRecord(raw.client);
  const patient = asRecord(raw.patient);
  const user = rawUser || client || patient;
  const rawProfile = asRecord(raw.profile);
  const clientRawProfile = profileBelongsToUser(rawProfile, user) ? rawProfile : null;
  const userProfile =
    asRecord(user?.profile) ||
    asRecord(user?.user_profile) ||
    asRecord(user?.userProfile) ||
    asRecord(client?.profile) ||
    asRecord(client?.user_profile) ||
    asRecord(client?.userProfile) ||
    asRecord(patient?.profile) ||
    asRecord(patient?.user_profile) ||
    asRecord(patient?.userProfile) ||
    asRecord(raw.user_profile) ||
    asRecord(raw.userProfile) ||
    asRecord(raw.client_profile) ||
    asRecord(raw.clientProfile) ||
    asRecord(raw.patient_profile) ||
    asRecord(raw.patientProfile) ||
    clientRawProfile;
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
  const clientEmail =
    readString(raw, ["user_email", "client_email", "email"]) ||
    readString(user, ["email"]);
  const clientId = readAppointmentClientId(raw, user, userProfile);
  const clientProfileId = readAppointmentClientProfileId(raw, user, userProfile);
  const bookAgainUrl = readString(raw, ["book_again_url", "bookAgainUrl"]);
  const specialistId =
    readString(raw, [
      "specialist_id",
      "specialistId",
      "specialist_profile_id",
      "specialistProfileId",
      "psychologist_id",
      "psychologistId",
      "doctor_id",
      "doctorId",
      "provider_id",
      "providerId",
    ]) ||
    readSpecialistReferenceId(
      raw.specialist,
      raw.specialist_profile,
      raw.specialistProfile,
      raw.psychologist,
      raw.doctor,
      raw.provider,
    ) ||
    readString(slot, [
      "specialist_id",
      "specialistId",
      "specialist_profile_id",
      "specialistProfileId",
      "psychologist_id",
      "psychologistId",
      "doctor_id",
      "doctorId",
      "provider_id",
      "providerId",
    ]) ||
    readSpecialistReferenceId(
      slot?.specialist,
      slot?.specialist_profile,
      slot?.specialistProfile,
      slot?.psychologist,
      slot?.doctor,
      slot?.provider,
    ) ||
    readSpecialistIdFromBookAgainUrl(bookAgainUrl);

  return {
    id: readString(raw, ["id"]) || `${parsed.date}-${parsed.time}`,
    status: readString(raw, ["status"]) || fallbackStatus,
    specialistId,
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
    clientId,
    clientProfileId,
    clientName,
    clientEmail,
    clientAvatar: resolveMediaUrl(
      readMediaValue(
        raw.client_avatar,
        raw.clientAvatar,
        raw.user_avatar,
        raw.userAvatar,
        raw.patient_avatar,
        raw.patientAvatar,
        raw.profile_avatar,
        raw.profileAvatar,
        raw.client_photo,
        raw.clientPhoto,
        raw.user_photo,
        raw.userPhoto,
        raw.patient_photo,
        raw.patientPhoto,
        readAvatarValue(userProfile, readProfileUser(userProfile) || user),
        readAvatarValue(user, readProfileUser(user) || user),
      ),
      FALLBACK_AVATAR,
    ),
    date: readString(raw, ["date"]) || readString(slot, ["date"]) || parsed.date,
    time: readString(raw, ["time"]) || readString(slot, ["time"]) || parsed.time,
    startsAt: startValue || `${readString(raw, ["date"]) || readString(slot, ["date"]) || parsed.date}T${readString(raw, ["time"]) || readString(slot, ["time"]) || parsed.time}`,
    bookAgainUrl,
  };
};

const buildAppointmentsUrl = (input: CabinetAppointmentQuery = {}) => {
  const endpoint = input.completed
    ? endpoints.consultationCompletedAppointments
    : endpoints.consultationAppointments;
  const params = new URLSearchParams();

  params.set("sort_field", "date");
  params.set("sort_direction", input.sortDirection || (input.completed ? "desc" : "asc"));

  if (input.user) params.set("user", input.user);
  if (input.date) params.set("date", input.date);

  return `${endpoint}?${params.toString()}`;
};

export async function getCabinetAppointments(
  input: CabinetAppointmentQuery = {},
  signal?: AbortSignal,
): Promise<CabinetAppointment[]> {
  const fallbackStatus = input.completed ? "completed" : "confirmed";
  const [appointments, userProfiles, specialistProfiles] = await Promise.all([
    fetchJson(buildAppointmentsUrl(input), signal).then((data) =>
      extractList(data).map((item) => normalizeAppointment(item, fallbackStatus)),
    ),
    fetchJson(endpoints.userProfiles, signal)
      .then(extractList)
      .catch(() => []),
    fetchJson(endpoints.specialists, signal)
      .then(extractList)
      .catch(() => []),
  ]);

  const appointmentsWithClientAvatars = await hydrateAppointmentClientAvatars(
    appointments,
    userProfiles,
    signal,
  );

  return hydrateAppointmentSpecialistLinks(appointmentsWithClientAvatars, specialistProfiles);
}

export async function getCurrentCabinetProfile(
  signal?: AbortSignal,
): Promise<CabinetProfile | null> {
  const token = getAccessToken();
  const refreshToken = getRefreshToken();
  if (!token && !refreshToken) return null;

  const storedUser = getStoredCurrentUser();
  let currentUser = storedUser;
  let userProfile: RawRecord | null = null;
  let specialistProfile: RawRecord | null = null;

  try {
    currentUser =
      normalizeCurrentUserResponse(await fetchJson(endpoints.me, signal)) ||
      storedUser;
    if (currentUser) storeCurrentUser(currentUser);
  } catch {
    currentUser = getStoredCurrentUser();
  }

  try {
    const directUserProfile = asRecord(currentUser?.user_profile ?? currentUser?.userProfile ?? currentUser?.profile);
    const directUserProfileId = readUserProfileId(currentUser);

    if (directUserProfileId) {
      try {
        userProfile = asRecord(await fetchJson(endpoints.userProfile(directUserProfileId), signal));
      } catch {
        userProfile = directUserProfile;
        if (!userProfile) {
          const profiles = extractList(await fetchJson(endpoints.userProfiles, signal));
          userProfile = profiles.find((profile) => matchesCurrentUser(profile, currentUser)) || null;
        }
      }
    } else if (directUserProfile) {
      userProfile = directUserProfile;
    } else {
      const profiles = extractList(await fetchJson(endpoints.userProfiles, signal));
      userProfile =
        profiles.find((profile) => matchesCurrentUser(profile, currentUser)) ||
        (!currentUser ? profiles[0] : null) ||
        null;
    }
  } catch {
    userProfile = null;
  }

  try {
    const currentRole = readString(currentUser, ["role"]).toLowerCase();
    const directSpecialist =
      asRecord(currentUser?.specialist_profile ?? currentUser?.specialistProfile) ||
      (currentRole.includes("specialist") ? asRecord(currentUser?.profile) : null);
    const directSpecialistId = readSpecialistProfileId(currentUser);

    if (directSpecialistId) {
      try {
        specialistProfile = asRecord(
          await fetchJson(endpoints.specialistProfile(directSpecialistId), signal),
        );
      } catch {
        specialistProfile = directSpecialist;
        if (!specialistProfile) {
          const profiles = extractList(await fetchJson(endpoints.specialists, signal));
          specialistProfile = profiles.find((profile) => matchesCurrentUser(profile, currentUser)) || null;
        }
      }
    } else if (directSpecialist) {
      specialistProfile = directSpecialist;
    }

    if (!specialistProfile && !directSpecialistId) {
      const profiles = extractList(await fetchJson(endpoints.specialists, signal));
      specialistProfile = profiles.find((profile) => matchesCurrentUser(profile, currentUser)) || null;
    }
  } catch {
    specialistProfile = null;
  }

  if (!getAccessToken() && !currentUser && !userProfile && !specialistProfile) {
    return null;
  }

  return normalizeProfile(currentUser, userProfile, specialistProfile);
}

export async function getUserCabinetData(signal?: AbortSignal): Promise<CabinetData> {
  const profile = await getCurrentCabinetProfile(signal);

  if (!profile) {
    return {
      profile: null,
      appointments: [],
      completedAppointments: [],
      documents: [],
    };
  }

  const [
    appointments,
    completedAppointments,
    documents,
    userProfiles,
    specialistProfiles,
  ] = await Promise.all([
    fetchJson(`${endpoints.consultationAppointments}?sort_field=date&sort_direction=asc`, signal)
      .then((data) => extractList(data).map((item) => normalizeAppointment(item, "confirmed")))
      .catch(() => []),
    fetchJson(`${endpoints.consultationCompletedAppointments}?sort_direction=desc`, signal)
      .then((data) => extractList(data).map((item) => normalizeAppointment(item, "completed")))
      .catch(() => []),
    fetchJson(endpoints.documents, signal)
      .then((data) => extractList(data).map(normalizeDocument))
      .catch(() => []),
    fetchJson(endpoints.userProfiles, signal)
      .then(extractList)
      .catch(() => []),
    fetchJson(endpoints.specialists, signal)
      .then(extractList)
      .catch(() => []),
  ]);
  const appointmentsWithClientAvatars = await hydrateAppointmentClientAvatars(
    appointments,
    userProfiles,
    signal,
  );
  const completedAppointmentsWithClientAvatars = await hydrateAppointmentClientAvatars(
    completedAppointments,
    userProfiles,
    signal,
  );

  return {
    profile,
    appointments: hydrateAppointmentSpecialistLinks(
      appointmentsWithClientAvatars,
      specialistProfiles,
    ),
    completedAppointments: hydrateAppointmentSpecialistLinks(
      completedAppointmentsWithClientAvatars,
      specialistProfiles,
    ),
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
    body.append("phone", normalizePhoneForSubmit(input.phone));
    body.append("city", input.city);
    body.append("specialisation", input.specialization);
    body.append("specialization", input.specialization);
    body.append("education", input.education);
    body.append("experience", input.experience);
    body.append("work_experience", input.experience);
    body.append("bio", input.about);
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

export async function createSpecialistProfile(input: SpecialistProfileCreateInput) {
  const token = getAccessToken();
  if (!token && !getRefreshToken()) {
    throw new Error("Authentication required");
  }

  const body = new FormData();
  body.append("first_name", input.firstName);
  body.append("last_name", input.lastName);
  body.append("phone", normalizePhoneForSubmit(input.phone));
  body.append("city", input.city);
  body.append("specialisation", input.specialization);
  body.append("specialization", input.specialization);
  body.append("education", input.education);
  body.append("experience", input.experience);
  body.append("work_experience", input.experience);
  body.append("bio", input.about);
  body.append("about", input.about);
  body.append("accept_data_processing_consent", String(input.acceptDataProcessingConsent));

  if (input.avatar) {
    body.append("avatar", input.avatar);
  }

  const response = await apiFetch(endpoints.specialists, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    const details = await response
      .json()
      .then((data) => JSON.stringify(data))
      .catch(() => "");
    throw new Error(`Profile creation failed: ${response.status}${details ? ` ${details}` : ""}`);
  }

  return response.json().catch(() => null);
}

export async function updateUserProfile(profileId: string, input: UserProfileUpdateInput) {
  const token = getAccessToken();
  if (!token && !getRefreshToken()) {
    throw new Error("Authentication required");
  }

  const createBody = (includeEducationOtherFallback = false) => {
    const body = new FormData();
    body.append("first_name", input.firstName);
    body.append("last_name", input.lastName);
    body.append("phone", normalizePhoneForSubmit(input.phone));
    body.append("city", input.city);
    body.append("birth_date", input.birthDate);
    body.append("bio", input.about);
    appendOptionalUserProfileFields(body, input);

    if (includeEducationOtherFallback && !input.education) {
      body.append("education_other", "Not specified");
    }

    return body;
  };

  let response = await apiFetch(endpoints.userProfile(profileId), {
    method: "PATCH",
    body: createBody(),
  });
  let errorData: unknown = null;

  if (!response.ok) {
    errorData = await parseJsonResponse(response);

    if (response.status === 400 && hasEducationOtherValidationError(errorData)) {
      response = await apiFetch(endpoints.userProfile(profileId), {
        method: "PATCH",
        body: createBody(true),
      });
      errorData = response.ok ? null : await parseJsonResponse(response);
    }
  }

  if (!response.ok) {
    const details = stringifyResponseDetails(errorData);
    throw new Error(`Profile update failed: ${response.status}${details ? ` ${details}` : ""}`);
  }

  return response.json().catch(() => null);
}

export async function createUserProfile(input: UserProfileCreateInput) {
  const token = getAccessToken();
  if (!token && !getRefreshToken()) {
    throw new Error("Authentication required");
  }

  const createBody = (includeEducationOtherFallback = false) => {
    const body = new FormData();
    body.append("first_name", input.firstName);
    body.append("last_name", input.lastName);
    body.append("phone", normalizePhoneForSubmit(input.phone));
    body.append("city", input.city);
    body.append("birth_date", input.birthDate);
    body.append("bio", input.about);
    body.append("accept_data_processing_consent", String(input.acceptDataProcessingConsent));
    appendOptionalUserProfileFields(body, input);

    if (includeEducationOtherFallback && !input.education) {
      body.append("education_other", "Not specified");
    }

    if (input.avatar) {
      body.append("avatar", input.avatar);
    }

    return body;
  };

  let response = await apiFetch(endpoints.userProfiles, {
    method: "POST",
    body: createBody(),
  });
  let errorData: unknown = null;

  if (!response.ok) {
    errorData = await parseJsonResponse(response);

    if (response.status === 400 && hasEducationOtherValidationError(errorData)) {
      response = await apiFetch(endpoints.userProfiles, {
        method: "POST",
        body: createBody(true),
      });
      errorData = response.ok ? null : await parseJsonResponse(response);
    }
  }

  if (!response.ok) {
    const details = stringifyResponseDetails(errorData);
    throw new Error(`Profile creation failed: ${response.status}${details ? ` ${details}` : ""}`);
  }

  return response.json().catch(() => null);
}

export async function createUserOnboardingProfile(
  input: UserOnboardingProfileCreateInput,
) {
  return createUserProfile(input);
}

export async function updateProfileAvatar(profile: CabinetProfile, avatar: File) {
  const token = getAccessToken();
  if (!token && !getRefreshToken()) {
    throw new Error("Authentication required");
  }

  const endpoint =
    profile.profileKind === "specialist"
      ? endpoints.specialistProfile(profile.specialistProfileId || profile.id)
      : profile.userProfileId
        ? endpoints.userProfile(profile.userProfileId)
        : "";

  if (!endpoint) {
    throw new Error("User profile id is missing");
  }

  const uploadWithField = (
    fieldName: "avatar" | "photo" | "image" | "picture",
    includeEducationOtherFallback = false,
  ) => {
    const body = new FormData();
    body.append(fieldName, avatar);

    if (includeEducationOtherFallback) {
      body.append("education_other", "Not specified");
    }

    return apiFetch(endpoint, {
      method: "PATCH",
      body,
    });
  };

  let response = await uploadWithField("avatar");
  let errorData: unknown = null;

  if (!response.ok && response.status === 400) {
    errorData = await parseJsonResponse(response);
    if (profile.profileKind !== "specialist" && hasEducationOtherValidationError(errorData)) {
      response = await uploadWithField("avatar", true);
      errorData = response.ok ? null : await parseJsonResponse(response);
    }
  }

  if (!response.ok && response.status === 400) {
    for (const fieldName of ["photo", "image", "picture"] as const) {
      response = await uploadWithField(fieldName);
      if (response.ok) break;
      errorData = await parseJsonResponse(response);
      if (profile.profileKind !== "specialist" && hasEducationOtherValidationError(errorData)) {
        response = await uploadWithField(fieldName, true);
        if (response.ok) break;
        errorData = await parseJsonResponse(response);
      }
    }
  }

  if (!response.ok) {
    const details = stringifyResponseDetails(errorData);
    throw new Error(`Avatar update failed: ${response.status}${details ? ` ${details}` : ""}`);
  }

  const data = await response.json().catch(() => null);
  profileAvatarVersion = String(Date.now());
  const updatedAvatar = readAvatarFromResponse(data) || withAvatarVersion(profile.avatar);

  window.dispatchEvent(
    new CustomEvent(PROFILE_AVATAR_CHANGED_EVENT, {
      detail: { avatar: updatedAvatar },
    }),
  );

  return updatedAvatar;
}

export async function uploadSpecialistDocuments(files: File[]) {
  const token = getAccessToken();
  if ((!token && !getRefreshToken()) || files.length === 0) return [];
  const filesToUpload = files.slice(0, 3);
  const results = [];

  for (const file of filesToUpload) {
    const body = new FormData();
    body.append("file", file);
    const response = await apiFetch(endpoints.documents, {
      method: "POST",
      body,
    });
    const data = await parseJsonResponse(response);

    if (!response.ok) {
      const details = stringifyResponseDetails(data);
      throw new Error(
        `Document upload failed: ${response.status}${details ? ` ${details}` : ""}`,
      );
    }

    results.push(data);
  }

  return results;
}
