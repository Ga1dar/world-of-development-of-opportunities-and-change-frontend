import { API_URL } from "./client";
import { endpoints } from "./endpoints";

export type EventItem = {
  id: number;
  title_ua: string;
  title_en: string;
  description_ua: string[];
  description_en: string[];
  category_ua: string;
  category_en: string;
  image: string;
  createdAt?: string;
  eventDate?: string;
};

type RawEvent = Record<string, unknown>;

const fallbackEvents: EventItem[] = [
  {
    id: 1,
    title_ua:
      "Воркшоп з травмапедагогіки для педагогів позашкільної освіти",
    title_en: "Workshop on trauma pedagogy for extracurricular educators",
    description_ua: [
      "Два дні, які відчулись на одному диханні.",
      "Команда ГO «СВІТИ» провела воркшоп з травмапедагогіки для педагогів позашкільної освіти — і це було більше, ніж навчання.",
      "Це були про досвід. Про проживання. Про розуміння себе і дітей поруч.",
      "Серйозні теми про травму, нервову систему і стрес дуже природно поєднувались із легкістю, сміхом і теплими вправами. Учасниці не просто слухали — вони проживали, відчували, впізнавали себе і своїх учнів у кожному прикладі.",
      "«Такі зустрічі мають бути регулярними» — звучало не раз.",
    ],
    description_en: [
      "Two days that felt like one shared space.",
      "The SVITY team held a trauma pedagogy workshop for extracurricular educators. It was more than just training.",
      "It was about experience. About living through it. About understanding yourself and the children nearby.",
      "Serious topics about trauma, the nervous system, and stress were naturally combined with ease, laughter, and warm exercises. The participants did not just listen, they lived through it, felt it, and recognized themselves and their students in every example.",
      "\u201cThese meetings should be regular,\u201d was heard more than once.",
    ],
    category_ua: "\u041e\u0441\u0432\u0456\u0442\u0430",
    category_en: "Education",
    image: "/rectangle 3.png",
  },
];

const asString = (value: unknown, fallback = "") => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
};

const asParagraphs = (value: unknown, fallback: string[]) => {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\n{2,}|\r?\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  return fallback;
};

const readNestedString = (value: unknown, keys: string[]) => {
  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;
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

const resolveImageUrl = (value: unknown) => {
  const image = asString(value);
  if (!image) return "/rectangle 3.png";
  if (/^https?:\/\//i.test(image)) return image;

  const apiOrigin = getApiOrigin();
  if (apiOrigin && image.startsWith("/")) {
    return image.startsWith("/media") || image.startsWith("/uploads")
      ? `${apiOrigin}${image}`
      : image;
  }

  return apiOrigin ? new URL(image, `${apiOrigin}/`).toString() : image;
};

const getSortTime = (event: EventItem) => {
  const date = event.createdAt || event.eventDate;
  if (!date) return 0;

  const time = Date.parse(date);
  return Number.isNaN(time) ? 0 : time;
};

const normalizeEvent = (raw: RawEvent, index: number): EventItem => {
  const fallback = fallbackEvents[0];
  const category = raw.category;

  const titleUa = asString(raw.title_ua) || asString(raw.title) || fallback.title_ua;
  const titleEn = asString(raw.title_en) || asString(raw.title) || titleUa || fallback.title_en;
  const categoryUa =
    asString(raw.category_ua) ||
    readNestedString(category, ["name_ua", "title_ua", "name", "title"]) ||
    fallback.category_ua;
  const categoryEn =
    asString(raw.category_en) ||
    readNestedString(category, ["name_en", "title_en", "name", "title"]) ||
    categoryUa ||
    fallback.category_en;

  return {
    id: Number(raw.id) || index + 1,
    title_ua: titleUa,
    title_en: titleEn,
    description_ua: asParagraphs(
      raw.description_ua ?? raw.content_ua ?? raw.text_ua ?? raw.description,
      fallback.description_ua
    ),
    description_en: asParagraphs(
      raw.description_en ?? raw.content_en ?? raw.text_en ?? raw.description,
      fallback.description_en
    ),
    category_ua: categoryUa,
    category_en: categoryEn,
    image: resolveImageUrl(raw.image ?? raw.photo ?? raw.picture ?? raw.image_url),
    createdAt: asString(raw.created_at ?? raw.createdAt ?? raw.created),
    eventDate: asString(raw.event_date ?? raw.eventDate ?? raw.date),
  };
};

export async function getEvents(): Promise<EventItem[]> {
  try {
    const response = await fetch(endpoints.events);

    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }

    const data = await response.json();
    const rawEvents = Array.isArray(data) ? data : data.results || data.events || [];

    return rawEvents
      .map(normalizeEvent)
      .sort((a: EventItem, b: EventItem) => {
        const byDate = getSortTime(b) - getSortTime(a);
        return byDate || b.id - a.id;
      });
  } catch (error) {
    console.error(error);
    return fallbackEvents;
  }
}
