import { API_URL } from "./client";
import { endpoints } from "./endpoints";

export type EventCategory = {
  id: number;
  slug: string;
  title_ua: string;
  title_en: string;
  image: string;
};

export type EventComment = {
  id: number;
  author: string;
  text: string;
  createdAt?: string;
};

export type EventItem = {
  id: number;
  slug: string;
  title_ua: string;
  title_en: string;
  description_ua: string[];
  description_en: string[];
  category_ua: string;
  category_en: string;
  categorySlug: string;
  image: string;
  galleryImages: string[];
  createdAt?: string;
  eventDate?: string;
  location?: string;
  comments: EventComment[];
};

export type EventRegistrationPayload = {
  full_name: string;
  email: string;
  phone: string;
  experience: string;
  comment?: string;
};

export type EventRegistrationResult =
  | { status: "success" }
  | { status: "network" }
  | { status: "error" };

export type CreateCommentPayload = {
  author: string;
  text: string;
};

type RawRecord = Record<string, unknown>;

const staticCategoryImages: Record<string, string> = {
  upcoming: "/Rectangle майбутни.png",
  workshop: "/Rectangle воркшоп.png",
  "kolyska-syly": "/Rectangle колиска сили.png",
  "art-workshop": "/Rectangle майстерня.png",
  "for-educators": "/Rectangle освітянам.png",
  supervision: "/Rectangle супервизия.png",
};

const fallbackEventImages: Record<string, string> = {
  upcoming: "/Rectangle майбутни.png",
  workshop: "/rectangle 3.png",
  "kolyska-syly": "/Rectangle колиска сили.png",
  "art-workshop": "/Rectangle майстерня.png",
  "for-educators": "/Rectangle освітянам.png",
  supervision: "/Rectangle супервизия.png",
};

const fallbackWorkshopGallery = [
  "/Rectangle воркшоп.png",
  "/rectangle 3.png",
  "/Rectangle супервизия.png",
  "/Rectangle майстерня.png",
  "/Rectangle освітянам.png",
];

const fallbackGenericGallery = [
  "/Rectangle майбутни.png",
  "/Rectangle воркшоп.png",
  "/Rectangle майстерня.png",
  "/Rectangle освітянам.png",
];

const fallbackCategories: EventCategory[] = [
  {
    id: 1,
    slug: "upcoming",
    title_ua: "Майбутні події та заняття",
    title_en: "Upcoming events and classes",
    image: staticCategoryImages.upcoming,
  },
  {
    id: 2,
    slug: "workshop",
    title_ua: "Воркшоп",
    title_en: "Workshop",
    image: staticCategoryImages.workshop,
  },
  {
    id: 3,
    slug: "kolyska-syly",
    title_ua: "«Колиска сили»",
    title_en: "Cradle of Strength",
    image: staticCategoryImages["kolyska-syly"],
  },
  {
    id: 4,
    slug: "art-workshop",
    title_ua: "Арт майстерня",
    title_en: "Art workshop",
    image: staticCategoryImages["art-workshop"],
  },
  {
    id: 5,
    slug: "for-educators",
    title_ua: "Для освітян",
    title_en: "For educators",
    image: staticCategoryImages["for-educators"],
  },
  {
    id: 6,
    slug: "supervision",
    title_ua: "Супервізія",
    title_en: "Supervision",
    image: staticCategoryImages.supervision,
  },
];

const fallbackEvents: EventItem[] = [
  {
    id: 1,
    slug: "trauma-pedagogy-workshop",
    title_ua:
      "Воркшоп з травмапедагогіки для педагогів позашкільної освіти",
    title_en: "Workshop on trauma pedagogy for extracurricular educators",
    description_ua: [
      "Два дні, які відчулись на одному диханні.",
      "Команда ГО «СВІТИ» провела воркшоп з травмапедагогіки для педагогів позашкільної освіти. Це було більше, ніж навчання.",
      "Це були про досвід, проживання, розуміння себе і дітей поруч.",
      "Серйозні теми про травму, нервову систему і стрес поєднувалися з легкістю, сміхом і теплими вправами.",
    ],
    description_en: [
      "Two days that felt like one shared space.",
      "The SVITY team held a trauma pedagogy workshop for extracurricular educators. It was more than just training.",
      "It was about experience, living through it, and understanding yourself and the children nearby.",
      "Serious topics about trauma, the nervous system, and stress were combined with ease, laughter, and warm exercises.",
    ],
    category_ua: "Воркшоп",
    category_en: "Workshop",
    categorySlug: "workshop",
    image: fallbackEventImages.workshop,
    galleryImages: fallbackWorkshopGallery,
    eventDate: "2026-04-17",
    location: "м. Покров",
    comments: [
      {
        id: 1,
        author: "Олена",
        text: "Дуже тепла і практична зустріч. Хочеться більше таких подій.",
        createdAt: "2026-04-20",
      },
    ],
  },
  {
    id: 2,
    slug: "future-events-and-classes",
    title_ua: "Майбутні події та заняття",
    title_en: "Upcoming events and classes",
    description_ua: [
      "Анонси подій, зустрічей і занять, які незабаром з'являться у розкладі.",
      "Після підключення сервера тут будуть показані події, завантажені командою.",
    ],
    description_en: [
      "Announcements of events, meetings, and classes that will appear in the schedule soon.",
      "After the backend is connected, this page will show events uploaded by the team.",
    ],
    category_ua: "Майбутні події та заняття",
    category_en: "Upcoming events and classes",
    categorySlug: "upcoming",
    image: fallbackEventImages.upcoming,
    galleryImages: fallbackGenericGallery,
    eventDate: "2026-04-17",
    location: "м. Покров",
    comments: [],
  },
  {
    id: 3,
    slug: "kolyska-syly-support-space",
    title_ua: "Жіночий простір «Колиска сили»",
    title_en: "Cradle of Strength support space",
    description_ua: [
      "Тепла зустріч для відновлення, опори та уважної розмови про власний ресурс.",
      "Це тимчасова подія-заглушка для перевірки вигляду сторінки категорії.",
    ],
    description_en: [
      "A warm meeting for recovery, support, and mindful conversation about personal resources.",
      "This is a temporary placeholder event for checking the category page layout.",
    ],
    category_ua: "«Колиска сили»",
    category_en: "Cradle of Strength",
    categorySlug: "kolyska-syly",
    image: fallbackEventImages["kolyska-syly"],
    galleryImages: fallbackGenericGallery,
    eventDate: "2026-04-17",
    location: "м. Покров",
    comments: [],
  },
  {
    id: 4,
    slug: "art-workshop-meeting",
    title_ua: "Арт майстерня для дітей та дорослих",
    title_en: "Art workshop for children and adults",
    description_ua: [
      "Творча зустріч, де можна працювати з матеріалами, образами та власними відчуттями.",
      "Коли бекенд поверне реальні події, ця заглушка автоматично поступиться їм місцем.",
    ],
    description_en: [
      "A creative meeting for working with materials, images, and personal feelings.",
      "When the backend returns real events, this placeholder will be replaced automatically.",
    ],
    category_ua: "Арт майстерня",
    category_en: "Art workshop",
    categorySlug: "art-workshop",
    image: fallbackEventImages["art-workshop"],
    galleryImages: fallbackGenericGallery,
    eventDate: "2026-04-17",
    location: "м. Покров",
    comments: [],
  },
  {
    id: 5,
    slug: "for-educators-support-meeting",
    title_ua: "Зустріч для освітян",
    title_en: "For educators support meeting",
    description_ua: [
      "Подія для тих, хто щодня підтримує дітей і потребує власного простору відновлення.",
      "Будемо говорити про стрес, ресурси, межі та турботу про себе в освітньому середовищі.",
      "Формат передбачає короткі пояснення, практичні вправи та простір для запитань.",
    ],
    description_en: [
      "An event for people who support children every day and need their own recovery space.",
      "We will talk about stress, resources, boundaries, and self-care in education.",
      "The format includes short explanations, practical exercises, and space for questions.",
    ],
    category_ua: "Для освітян",
    category_en: "For educators",
    categorySlug: "for-educators",
    image: fallbackEventImages["for-educators"],
    galleryImages: fallbackGenericGallery,
    eventDate: "2026-04-17",
    location: "м. Покров",
    comments: [],
  },
  {
    id: 6,
    slug: "supervision-meeting",
    title_ua: "Супервізійна зустріч для фахівців",
    title_en: "Supervision meeting for specialists",
    description_ua: [
      "Професійна зустріч для розбору запитів, підтримки практики та обміну досвідом.",
      "Це резервна подія, яка показується, якщо сервер поки не відповідає.",
    ],
    description_en: [
      "A professional meeting for reviewing cases, supporting practice, and exchanging experience.",
      "This reserve event is shown when the server is not responding yet.",
    ],
    category_ua: "Супервізія",
    category_en: "Supervision",
    categorySlug: "supervision",
    image: fallbackEventImages.supervision,
    galleryImages: fallbackGenericGallery,
    eventDate: "2026-04-17",
    location: "м. Покров",
    comments: [],
  },
];

const asRecord = (value: unknown): RawRecord | null =>
  value && typeof value === "object" ? (value as RawRecord) : null;

const asString = (value: unknown, fallback = "") => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
};

const asNumber = (value: unknown, fallback: number) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : fallback;
};

const slugify = (value: string, fallback: string) => {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
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

const resolveImageList = (value: unknown, fallback: string[]) => {
  if (!Array.isArray(value)) return fallback;

  const images = value
    .map((item) => {
      const record = asRecord(item);
      const source = record
        ? record.image ?? record.photo ?? record.picture ?? record.url ?? record.src
        : item;

      return resolveImageUrl(source, "");
    })
    .filter(Boolean)
    .slice(0, 8);

  return images.length ? images : fallback;
};

const extractList = (data: unknown, keys: string[]) => {
  if (Array.isArray(data)) return data.filter(Boolean);

  const record = asRecord(data);
  if (!record) return [];

  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value.filter(Boolean);
  }

  return [];
};

const normalizeComment = (raw: unknown, index: number): EventComment => {
  const record = asRecord(raw) || {};

  return {
    id: asNumber(record.id, index + 1),
    author: asString(record.author ?? record.name ?? record.user_name, "Гість"),
    text: asString(record.text ?? record.comment ?? record.body),
    createdAt: asString(record.created_at ?? record.createdAt ?? record.created),
  };
};

const normalizeCategory = (raw: unknown, index: number): EventCategory => {
  const fallback = fallbackCategories[index % fallbackCategories.length];
  const record = asRecord(raw);
  if (!record) return fallback;

  const titleUa =
    asString(record.title_ua ?? record.name_ua) ||
    asString(record.title ?? record.name) ||
    fallback.title_ua;
  const titleEn =
    asString(record.title_en ?? record.name_en) ||
    asString(record.title ?? record.name) ||
    titleUa ||
    fallback.title_en;
  const slug =
    asString(record.slug) ||
    slugify(asString(record.code) || titleEn || titleUa, fallback.slug);

  return {
    id: asNumber(record.id, fallback.id || index + 1),
    slug,
    title_ua: titleUa,
    title_en: titleEn,
    image: staticCategoryImages[slug] || fallback.image,
  };
};

const normalizeEvent = (raw: unknown, index: number): EventItem => {
  const fallback = fallbackEvents[index % fallbackEvents.length];
  const record = asRecord(raw);
  if (!record) return fallback;

  const category = record.category;
  const titleUa =
    asString(record.title_ua) || asString(record.title) || fallback.title_ua;
  const titleEn =
    asString(record.title_en) || asString(record.title) || titleUa || fallback.title_en;
  const categoryUa =
    asString(record.category_ua) ||
    readNestedString(category, ["title_ua", "name_ua", "title", "name"]) ||
    fallback.category_ua;
  const categoryEn =
    asString(record.category_en) ||
    readNestedString(category, ["title_en", "name_en", "title", "name"]) ||
    categoryUa ||
    fallback.category_en;
  const categorySlug =
    asString(record.category_slug) ||
    readNestedString(category, ["slug", "code"]) ||
    slugify(categoryEn || categoryUa, fallback.categorySlug);

  return {
    id: asNumber(record.id, fallback.id || index + 1),
    slug: asString(record.slug) || slugify(titleEn || titleUa, fallback.slug),
    title_ua: titleUa,
    title_en: titleEn,
    description_ua: asParagraphs(
      record.description_ua ?? record.content_ua ?? record.text_ua ?? record.description,
      fallback.description_ua,
    ),
    description_en: asParagraphs(
      record.description_en ?? record.content_en ?? record.text_en ?? record.description,
      fallback.description_en,
    ),
    category_ua: categoryUa,
    category_en: categoryEn,
    categorySlug,
    image: resolveImageUrl(
      record.image ?? record.photo ?? record.picture ?? record.image_url,
      fallback.image,
    ),
    galleryImages: resolveImageList(
      record.gallery_images ??
        record.galleryImages ??
        record.images ??
        record.photos ??
        record.gallery,
      fallback.galleryImages,
    ),
    createdAt: asString(record.created_at ?? record.createdAt ?? record.created),
    eventDate: asString(record.event_date ?? record.eventDate ?? record.date),
    location: asString(record.location ?? record.place, fallback.location),
    comments: extractList(record.comments, ["comments", "results"]).map(normalizeComment),
  };
};

const getSortTime = (event: EventItem) => {
  const date = event.createdAt || event.eventDate;
  if (!date) return 0;

  const time = Date.parse(date);
  return Number.isNaN(time) ? 0 : time;
};

const requestJson = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => null);
  return { response, data };
};

const authHeaders = () => {
  const accessToken = localStorage.getItem("accessToken");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
};

export async function getEventCategories(): Promise<EventCategory[]> {
  try {
    const { response, data } = await requestJson(endpoints.eventCategories);

    if (!response.ok) {
      throw new Error("Failed to fetch event categories");
    }

    const rawCategories = extractList(data, ["results", "categories", "data"]);
    return rawCategories.length
      ? rawCategories.map(normalizeCategory)
      : fallbackCategories;
  } catch (error) {
    console.error(error);
    return fallbackCategories;
  }
}

export async function getEvents(): Promise<EventItem[]> {
  try {
    const { response, data } = await requestJson(endpoints.events);

    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }

    const rawEvents = extractList(data, ["results", "events", "data"]);
    const events = rawEvents.length ? rawEvents.map(normalizeEvent) : fallbackEvents;

    return events.sort((a, b) => {
      const byDate = getSortTime(b) - getSortTime(a);
      return byDate || b.id - a.id;
    });
  } catch (error) {
    console.error(error);
    return fallbackEvents;
  }
}

export async function getEventsByCategory(categorySlug: string) {
  const fallback = fallbackEvents.filter(
    (event) => event.categorySlug === categorySlug,
  );

  try {
    const url = new URL(endpoints.events);
    url.searchParams.set("category", categorySlug);

    const { response, data } = await requestJson(url.toString());

    if (!response.ok) {
      throw new Error("Failed to fetch category events");
    }

    const rawEvents = extractList(data, ["results", "events", "data"]);
    const events = rawEvents.length ? rawEvents.map(normalizeEvent) : fallback;

    return events.sort((a, b) => {
      const byDate = getSortTime(b) - getSortTime(a);
      return byDate || b.id - a.id;
    });
  } catch (error) {
    console.error(error);
    return fallback;
  }
}

export async function getEvent(id: string | number): Promise<EventItem | null> {
  try {
    const { response, data } = await requestJson(endpoints.eventDetail(id));

    if (!response.ok) {
      throw new Error("Failed to fetch event");
    }

    return normalizeEvent(data, 0);
  } catch (error) {
    console.error(error);
    const events = await getEvents();
    return (
      events.find((event) => String(event.id) === String(id) || event.slug === String(id)) ||
      null
    );
  }
}

export async function getEventComments(eventId: string | number) {
  try {
    const { response, data } = await requestJson(endpoints.eventComments(eventId));

    if (!response.ok) {
      throw new Error("Failed to fetch comments");
    }

    return extractList(data, ["results", "comments", "data"]).map(normalizeComment);
  } catch (error) {
    console.error(error);
    const event = await getEvent(eventId);
    return event?.comments || [];
  }
}

export async function createEventComment(
  eventId: string | number,
  payload: CreateCommentPayload,
) {
  const author = payload.author.trim().slice(0, 80);
  const text = payload.text.trim().slice(0, 1000);

  if (!author || text.length < 2) {
    throw new Error("Invalid comment");
  }

  const { response, data } = await requestJson(endpoints.eventComments(eventId), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ author, text }),
  });

  if (!response.ok) {
    throw new Error("Failed to create comment");
  }

  return normalizeComment(data, 0);
}

export async function registerForEvent(
  eventId: string | number,
  payload: EventRegistrationPayload,
): Promise<EventRegistrationResult> {
  const cleanPayload: EventRegistrationPayload = {
    full_name: payload.full_name.trim().slice(0, 120),
    email: payload.email.trim().slice(0, 160),
    phone: payload.phone.trim().slice(0, 40),
    experience: payload.experience.trim().slice(0, 80),
    comment: payload.comment?.trim().slice(0, 1000) || "",
  };

  if (
    !cleanPayload.full_name ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanPayload.email) ||
    cleanPayload.phone.length < 7 ||
    !cleanPayload.experience
  ) {
    return { status: "error" };
  }

  try {
    const { response } = await requestJson(endpoints.eventRegistration(eventId), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(cleanPayload),
    });

    if (response.ok) {
      return { status: "success" };
    }

    return { status: "error" };
  } catch (error) {
    console.error(error);
    return { status: "network" };
  }
}

export { fallbackCategories, fallbackEvents };
