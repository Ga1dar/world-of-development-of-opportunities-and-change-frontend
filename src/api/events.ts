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
      "\u0412\u043e\u0440\u043a\u0448\u043e\u043f \u0437 \u0442\u0440\u0430\u0432\u043c\u0430\u043f\u0435\u0434\u0430\u0433\u043e\u0433\u0456\u043a\u0438 \u0434\u043b\u044f \u043f\u0435\u0434\u0430\u0433\u043e\u0433\u0456\u0432 \u043f\u043e\u0437\u0430\u0448\u043a\u0456\u043b\u044c\u043d\u043e\u0457 \u043e\u0441\u0432\u0456\u0442\u0438",
    title_en: "Workshop on trauma pedagogy for extracurricular educators",
    description_ua: [
      "\u0414\u0432\u0430 \u0434\u043d\u0456, \u044f\u043a\u0456 \u0432\u0456\u0434\u0447\u0443\u043b\u0438\u0441\u044c \u044f\u043a \u043e\u0434\u043d\u0430 \u043a\u0443\u0445\u043d\u044f.",
      "\u041a\u043e\u043c\u0430\u043d\u0434\u0430 \u0413\u041e \u00ab\u0421\u0412\u0406\u0422\u0418\u00bb \u043f\u0440\u043e\u0432\u0435\u043b\u0430 \u0432\u043e\u0440\u043a\u0448\u043e\u043f \u0437 \u0442\u0440\u0430\u0432\u043c\u0430\u043f\u0435\u0434\u0430\u0433\u043e\u0433\u0456\u043a\u0438 \u0434\u043b\u044f \u043f\u0435\u0434\u0430\u0433\u043e\u0433\u0456\u0432 \u043f\u043e\u0437\u0430\u0448\u043a\u0456\u043b\u044c\u043d\u043e\u0457 \u043e\u0441\u0432\u0456\u0442\u0438. \u0426\u0435 \u0431\u0443\u043b\u043e \u0431\u0456\u043b\u044c\u0448\u0435, \u043d\u0456\u0436 \u043d\u0430\u0432\u0447\u0430\u043d\u043d\u044f.",
      "\u0426\u0435 \u0431\u0443\u043b\u0438 \u043f\u0440\u043e \u0434\u043e\u0441\u0432\u0456\u0434. \u041f\u0440\u043e \u043f\u0440\u043e\u0436\u0438\u0432\u0430\u043d\u043d\u044f. \u041f\u0440\u043e \u0440\u043e\u0437\u0443\u043c\u0456\u043d\u043d\u044f \u0441\u0435\u0431\u0435 \u0456 \u0434\u0456\u0442\u0435\u0439 \u043f\u043e\u0440\u0443\u0447.",
      "\u0421\u0435\u0440\u0439\u043e\u0437\u043d\u0456 \u0442\u0435\u043c\u0438 \u043f\u0440\u043e \u0442\u0440\u0430\u0432\u043c\u0443, \u043d\u0435\u0440\u0432\u043e\u0432\u0443 \u0441\u0438\u0441\u0442\u0435\u043c\u0443 \u0456 \u0441\u0442\u0440\u0435\u0441 \u0434\u0443\u0436\u0435 \u043f\u0440\u0438\u0440\u043e\u0434\u043d\u043e \u043f\u043e\u0454\u0434\u043d\u0443\u0432\u0430\u043b\u0438\u0441\u044c \u0456\u0437 \u043b\u0435\u0433\u043a\u0456\u0441\u0442\u044e, \u0441\u043c\u0456\u0445\u043e\u043c \u0456 \u0442\u0435\u043f\u043b\u0438\u043c\u0438 \u0432\u043f\u0440\u0430\u0432\u0430\u043c\u0438. \u0423\u0447\u0430\u0441\u043d\u0438\u0446\u0456 \u043d\u0435 \u043f\u0440\u043e\u0441\u0442\u043e \u0441\u043b\u0443\u0445\u0430\u043b\u0438, \u0432\u043e\u043d\u0438 \u043f\u0440\u043e\u0436\u0438\u0432\u0430\u043b\u0438, \u0432\u0456\u0434\u0447\u0443\u0432\u0430\u043b\u0438, \u0432\u043f\u0456\u0437\u043d\u0430\u0432\u0430\u043b\u0438 \u0441\u0435\u0431\u0435 \u0456 \u0441\u0432\u043e\u0457\u0445 \u0443\u0447\u043d\u0456\u0432 \u0443 \u043a\u043e\u0436\u043d\u043e\u043c\u0443 \u043f\u0440\u0438\u043a\u043b\u0430\u0434\u0456.",
      "\u00ab\u0422\u0430\u043a\u0456 \u0437\u0443\u0441\u0442\u0440\u0456\u0447\u0456 \u043c\u0430\u044e\u0442\u044c \u0431\u0443\u0442\u0438 \u0440\u0435\u0433\u0443\u043b\u044f\u0440\u043d\u0438\u043c\u0438\u00bb \u2014 \u0437\u0432\u0443\u0447\u0430\u043b\u043e \u043d\u0435 \u0440\u0430\u0437.",
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
