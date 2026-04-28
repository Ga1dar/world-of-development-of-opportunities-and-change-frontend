import { API_URL } from "./client";
import { endpoints } from "./endpoints";

export type Specialist = {
  id: number;
  photo: string;
  nameUa: string;
  nameEn: string;
  roleUa: string;
  roleEn: string;
  aboutUa: string[];
  aboutEn: string[];
  educationUa: string[];
  educationEn: string[];
  experienceUa: string[];
  experienceEn: string[];
  specializationsUa: string[];
  specializationsEn: string[];
  phone?: string;
  email?: string;
};

type RawSpecialist = Record<string, unknown>;

const fallbackSpecialists: Specialist[] = [
  {
    id: 1,
    photo: "/lashenko 1.png",
    nameUa: "Ляшенко Альона",
    nameEn: "Alona Liashenko",
    roleUa: "Кризова психологиня, травмопедагогиня, тренерка з травмопедагогіки",
    roleEn: "Crisis psychologist, trauma pedagogue, trauma pedagogy trainer",
    aboutUa: [
      "Працює з дітьми, підлітками та дорослими у станах стресу, втрати й емоційного виснаження.",
      "Допомагає відновлювати відчуття опори, безпеки та внутрішнього ресурсу.",
    ],
    aboutEn: [
      "Works with children, teenagers and adults in states of stress, loss and emotional exhaustion.",
      "Helps restore a sense of support, safety and inner resources.",
    ],
    educationUa: [
      "Харківський державний педагогічний університет ім Г.С.Сковороди та друга вища освіта Університет цивільного захисту України",
    ],
    educationEn: [
      "H. S. Skovoroda Kharkiv National Pedagogical University and second higher education at the University of Civil Protection of Ukraine",
    ],
    experienceUa: ["10 років"],
    experienceEn: ["10 years"],
    specializationsUa: [
      "Кризова психологія, сертифікації: травмопедагогиня, тренерка з травмопедагогіки",
    ],
    specializationsEn: [
      "Crisis psychology, certifications: trauma pedagogue, trauma pedagogy trainer",
    ],
  },
  {
    id: 2,
    photo: "/romanova 1.png",
    nameUa: "Романова Ганна",
    nameEn: "Hanna Romanova",
    roleUa: "Травмопедагогиня",
    roleEn: "Trauma-informed educator",
    aboutUa: [
      "Проводить підтримувальні зустрічі та заняття, де складні теми можна проживати безпечно.",
      "Працює з групами та індивідуальними запитами у сфері травмоінформованої освіти.",
    ],
    aboutEn: [
      "Runs supportive sessions where difficult topics can be processed safely.",
      "Works with groups and individual requests in trauma-informed education.",
    ],
    educationUa: ["Травмопедагогіка", "Групова підтримка"],
    educationEn: ["Trauma pedagogy", "Group support"],
    experienceUa: ["Освітні воркшопи", "Підтримка педагогів"],
    experienceEn: ["Educational workshops", "Teacher support"],
    specializationsUa: ["Травмопедагогіка", "Ресурсні практики"],
    specializationsEn: ["Trauma pedagogy", "Resource practices"],
  },
  {
    id: 3,
    photo: "/andruschenko.png",
    nameUa: "Наталія Андрущенко",
    nameEn: "Nataliia Andrushchenko",
    roleUa: "Координаторка",
    roleEn: "Coordinator",
    aboutUa: [
      "Координує взаємодію команди, спеціалістів та учасників простору СвіТи.",
      "Допомагає вибудовувати маршрут підтримки та знаходити потрібного фахівця.",
    ],
    aboutEn: [
      "Coordinates the interaction between the team, specialists and participants of Svity.",
      "Helps build a support path and find the right specialist.",
    ],
    educationUa: ["Координація соціальних проєктів"],
    educationEn: ["Social project coordination"],
    experienceUa: ["Командна координація", "Супровід запитів"],
    experienceEn: ["Team coordination", "Request support"],
    specializationsUa: ["Координація", "Комунікація"],
    specializationsEn: ["Coordination", "Communication"],
  },
];

const asString = (value: unknown, fallback = "") => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
};

const asNumber = (value: unknown, fallback: number) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : fallback;
};

const asRecord = (value: unknown): RawSpecialist | null => {
  return value && typeof value === "object" ? (value as RawSpecialist) : null;
};

const asParagraphs = (value: unknown, fallback: string[]) => {
  if (Array.isArray(value)) {
    const items = value.map((item) => asString(item)).filter(Boolean);
    return items.length ? items : fallback;
  }

  if (typeof value === "string") {
    const items = value
      .split(/\n{2,}|\r?\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    return items.length ? items : fallback;
  }

  return fallback;
};

const readNestedString = (value: unknown, keys: string[]) => {
  const record = asRecord(value);
  if (!record) return "";

  for (const key of keys) {
    const candidate = asString(record[key]);
    if (candidate) return candidate;
  }

  return "";
};

const readString = (raw: RawSpecialist, keys: string[]) => {
  for (const key of keys) {
    const value = raw[key];

    if (key.includes(".")) {
      const [parentKey, childKey] = key.split(".");
      const nestedValue = readNestedString(raw[parentKey], [childKey]);
      if (nestedValue) return nestedValue;
      continue;
    }

    const candidate = asString(value);
    if (candidate) return candidate;
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

const resolveImageUrl = (value: unknown, fallback: string) => {
  const image = asString(value);
  if (!image) return fallback;
  if (/^https?:\/\//i.test(image)) return image;

  const apiOrigin = getApiOrigin();
  if (apiOrigin && image.startsWith("/")) {
    return image.startsWith("/media") || image.startsWith("/uploads")
      ? `${apiOrigin}${image}`
      : image;
  }

  return apiOrigin ? new URL(image, `${apiOrigin}/`).toString() : image;
};

const normalizeSpecialist = (
  raw: RawSpecialist,
  index: number,
  fallback = fallbackSpecialists[index % fallbackSpecialists.length],
): Specialist => {
  const user = asRecord(raw.user);
  const firstNameUa =
    readString(raw, ["first_name_ua", "first_name"]) ||
    readNestedString(user, ["first_name_ua", "first_name"]);
  const lastNameUa =
    readString(raw, ["last_name_ua", "last_name"]) ||
    readNestedString(user, ["last_name_ua", "last_name"]);
  const firstNameEn =
    readString(raw, ["first_name_en", "first_name"]) ||
    readNestedString(user, ["first_name_en", "first_name"]);
  const lastNameEn =
    readString(raw, ["last_name_en", "last_name"]) ||
    readNestedString(user, ["last_name_en", "last_name"]);

  const nameUa =
    readString(raw, ["name_ua", "full_name_ua", "full_name", "name", "user.name"]) ||
    [lastNameUa, firstNameUa].filter(Boolean).join(" ") ||
    fallback.nameUa;
  const nameEn =
    readString(raw, ["name_en", "full_name_en", "full_name", "name", "user.name"]) ||
    [firstNameEn, lastNameEn].filter(Boolean).join(" ") ||
    fallback.nameEn;
  const roleUa =
    readString(raw, [
      "role_ua",
      "position_ua",
      "specialization_ua",
      "speciality_ua",
      "profession_ua",
    ]) || fallback.roleUa;
  const roleEn =
    readString(raw, [
      "role_en",
      "position_en",
      "specialization_en",
      "speciality_en",
      "profession_en",
    ]) ||
    readString(raw, ["role", "position", "specialization", "speciality", "profession"]) ||
    fallback.roleEn;

  return {
    id: asNumber(raw.id, fallback.id || index + 1),
    photo: resolveImageUrl(
      raw.photo ?? raw.avatar ?? raw.image ?? raw.picture ?? raw.photo_url,
      fallback.photo,
    ),
    nameUa,
    nameEn,
    roleUa,
    roleEn,
    aboutUa: asParagraphs(
      raw.about_ua ?? raw.bio_ua ?? raw.description_ua ?? raw.about ?? raw.bio,
      fallback.aboutUa,
    ),
    aboutEn: asParagraphs(
      raw.about_en ?? raw.bio_en ?? raw.description_en ?? raw.about ?? raw.bio,
      fallback.aboutEn,
    ),
    educationUa: asParagraphs(raw.education_ua ?? raw.education, fallback.educationUa),
    educationEn: asParagraphs(raw.education_en ?? raw.education, fallback.educationEn),
    experienceUa: asParagraphs(raw.experience_ua ?? raw.experience, fallback.experienceUa),
    experienceEn: asParagraphs(raw.experience_en ?? raw.experience, fallback.experienceEn),
    specializationsUa: asParagraphs(
      raw.specializations_ua ?? raw.services_ua ?? raw.specializations ?? raw.services,
      fallback.specializationsUa,
    ),
    specializationsEn: asParagraphs(
      raw.specializations_en ?? raw.services_en ?? raw.specializations ?? raw.services,
      fallback.specializationsEn,
    ),
    phone:
      readString(raw, ["phone", "phone_number", "user.phone", "user.phone_number"]) ||
      undefined,
    email: readString(raw, ["email", "user.email"]) || undefined,
  };
};

const extractList = (data: unknown): RawSpecialist[] => {
  if (Array.isArray(data)) return data.filter((item) => asRecord(item));

  const record = asRecord(data);
  if (!record) return [];

  const results = record.results ?? record.specialists ?? record.profiles ?? record.data;
  return Array.isArray(results) ? results.filter((item) => asRecord(item)) : [];
};

export async function getSpecialists(): Promise<Specialist[]> {
  try {
    const response = await fetch(endpoints.specialists);

    if (!response.ok) {
      throw new Error("Failed to fetch specialist profiles");
    }

    const data = await response.json();
    const rawSpecialists = extractList(data);

    return rawSpecialists.length
      ? rawSpecialists.map((item, index) => normalizeSpecialist(item, index))
      : fallbackSpecialists;
  } catch (error) {
    console.error(error);
    return fallbackSpecialists;
  }
}

export async function getSpecialist(id: string | number): Promise<Specialist | null> {
  const fallback = fallbackSpecialists.find((item) => String(item.id) === String(id));

  try {
    const response = await fetch(endpoints.specialistProfile(id));

    if (!response.ok) {
      throw new Error("Failed to fetch specialist profile");
    }

    const data = await response.json();
    const record = asRecord(data);

    return record
      ? normalizeSpecialist(record, fallback ? fallback.id - 1 : 0, fallback)
      : fallback || null;
  } catch (error) {
    console.error(error);
    return fallback || null;
  }
}
