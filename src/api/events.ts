import { API_URL } from "./client";
import { endpoints } from "./endpoints";
import { apiFetch, getAccessToken, getStoredCurrentUser } from "./auth";

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
  userAvatar?: string;
  text: string;
  likesCount?: number;
  isLiked?: boolean;
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
  categoryId?: number;
  categorySlug: string;
  image: string;
  galleryImages: string[];
  likesCount?: number;
  isLiked?: boolean;
  commentsCount?: number;
  createdAt?: string;
  eventDate?: string;
  location?: string;
  comments: EventComment[];
  isFallback?: boolean;
};

export type EventRegistrationPayload = {
  full_name: string;
  birth_date: string;
  gender: string;
  email: string;
  phone: string;
  experience: string;
  eating_meat: boolean;
  is_agreed: boolean;
};

export type CreateEventCategoryPayload = {
  name: string;
  image: File;
};

export type CreateEventPayload = {
  title: string;
  description: string;
  category: number;
  images: File[];
};

export type EventRegistrationResult =
  | { status: "success" }
  | { status: "network" }
  | { status: "error" };

export type CreateCommentPayload = {
  text: string;
};

export type ToggleResult = {
  liked: boolean;
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
].map((event) => ({ ...event, isFallback: true }));

const LIKED_EVENT_IDS_STORAGE_KEY = "svityLikedEventIds";
const EVENT_REACTIONS_STORAGE_KEY = "svityEventReactions";
const EVENT_COMMENT_REACTIONS_STORAGE_KEY = "svityEventCommentReactions";

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

const readStoredLikedEventIds = () => {
  if (typeof window === "undefined") return new Set<number>();

  try {
    const values = JSON.parse(localStorage.getItem(LIKED_EVENT_IDS_STORAGE_KEY) || "[]");
    return new Set(
      Array.isArray(values)
        ? values.map((value) => Number(value)).filter((value) => Number.isFinite(value))
        : [],
    );
  } catch {
    return new Set<number>();
  }
};

const saveStoredLikedEventIds = (ids: Set<number>) => {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    LIKED_EVENT_IDS_STORAGE_KEY,
    JSON.stringify(Array.from(ids).sort((a, b) => a - b)),
  );
};

type StoredEventReaction = {
  liked: boolean;
  likesCount: number;
};

const eventReactionKey = (eventId: string | number) => String(eventId);

const readStoredEventReactions = () => {
  if (typeof window === "undefined") return {};

  try {
    const value = JSON.parse(localStorage.getItem(EVENT_REACTIONS_STORAGE_KEY) || "{}");
    return value && typeof value === "object"
      ? (value as Record<string, StoredEventReaction>)
      : {};
  } catch {
    return {};
  }
};

const saveStoredEventReactions = (reactions: Record<string, StoredEventReaction>) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(EVENT_REACTIONS_STORAGE_KEY, JSON.stringify(reactions));
};

const readStoredEventReaction = (eventId: string | number) => {
  const reactions = readStoredEventReactions();
  return reactions[eventReactionKey(eventId)] || null;
};

const syncStoredEventLike = (
  eventId: string | number,
  liked: boolean,
  likesCount?: number,
) => {
  const numericId = Number(eventId);
  if (!Number.isFinite(numericId)) return;

  const ids = readStoredLikedEventIds();
  if (liked) ids.add(numericId);
  else ids.delete(numericId);
  saveStoredLikedEventIds(ids);

  const reactions = readStoredEventReactions();
  const key = eventReactionKey(eventId);
  const current = reactions[key];
  reactions[key] = {
    liked,
    likesCount:
      typeof likesCount === "number" && Number.isFinite(likesCount)
        ? Math.max(likesCount, 0)
        : current?.likesCount || (liked ? 1 : 0),
  };
  saveStoredEventReactions(reactions);
};

export const getLocallyLikedEventIds = () => readStoredLikedEventIds();

const applyStoredEventReaction = (event: EventItem): EventItem => {
  const storedReaction = readStoredEventReaction(event.id);
  const localLiked = readStoredLikedEventIds().has(event.id);

  if (!storedReaction && !localLiked) return event;

  return {
    ...event,
    isLiked: storedReaction?.liked ?? localLiked,
    likesCount:
      storedReaction?.likesCount ??
      Math.max(event.likesCount || 0, localLiked ? 1 : 0),
  };
};

const applyStoredEventReactions = (events: EventItem[]) =>
  events.map(applyStoredEventReaction);

type StoredEventCommentReaction = {
  liked: boolean;
  likesCount: number;
};

const eventCommentReactionKey = (
  eventId: string | number,
  commentId: string | number,
) => `${String(eventId)}:${String(commentId)}`;

const readStoredEventCommentReactions = () => {
  if (typeof window === "undefined") return {};

  try {
    const value = JSON.parse(
      localStorage.getItem(EVENT_COMMENT_REACTIONS_STORAGE_KEY) || "{}",
    );

    return value && typeof value === "object"
      ? (value as Record<string, StoredEventCommentReaction>)
      : {};
  } catch {
    return {};
  }
};

const saveStoredEventCommentReactions = (
  reactions: Record<string, StoredEventCommentReaction>,
) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(EVENT_COMMENT_REACTIONS_STORAGE_KEY, JSON.stringify(reactions));
};

export const readStoredEventCommentReaction = (
  eventId: string | number,
  commentId: string | number,
) => {
  const reactions = readStoredEventCommentReactions();
  return reactions[eventCommentReactionKey(eventId, commentId)] || null;
};

export const toggleStoredEventCommentLike = (
  eventId: string | number,
  commentId: string | number,
  currentLiked: boolean,
  currentLikesCount: number,
) => {
  const liked = !currentLiked;
  const likesCount = Math.max(currentLikesCount + (liked ? 1 : -1), 0);
  const reactions = readStoredEventCommentReactions();

  reactions[eventCommentReactionKey(eventId, commentId)] = { liked, likesCount };
  saveStoredEventCommentReactions(reactions);

  return { liked, likesCount };
};

const isSameCurrentUser = (candidate: unknown) => {
  const currentUser = getStoredCurrentUser();
  if (!currentUser) return false;

  const currentId = asString(currentUser.id);
  const currentEmail = asString(currentUser.email).toLowerCase();
  const candidateRecord = asRecord(candidate);

  if (!candidateRecord) {
    const candidateId = asString(candidate);
    return Boolean(currentId && candidateId === currentId);
  }

  const userRecord = asRecord(candidateRecord.user);
  const candidateId =
    asString(candidateRecord.id) ||
    asString(candidateRecord.user_id) ||
    asString(candidateRecord.userId) ||
    asString(userRecord?.id);
  const candidateEmail =
    asString(candidateRecord.email).toLowerCase() ||
    asString(userRecord?.email).toLowerCase();

  return Boolean(
    (currentId && candidateId === currentId) ||
      (currentEmail && candidateEmail === currentEmail),
  );
};

const hasCurrentUserLike = (record: RawRecord, eventId: number) => {
  const explicitLike =
    record.is_liked ??
    record.isLiked ??
    record.liked ??
    record.liked_by_user ??
    record.likedByUser ??
    record.current_user_liked ??
    record.currentUserLiked;

  if (typeof explicitLike === "boolean") return explicitLike;

  const likes = record.likes ?? record.event_likes ?? record.eventLikes;
  if (Array.isArray(likes) && likes.some(isSameCurrentUser)) return true;

  return readStoredLikedEventIds().has(eventId);
};

const normalizeComment = (raw: unknown, index: number): EventComment => {
  const record = asRecord(raw) || {};
  const isLiked =
    record.is_liked ??
    record.isLiked ??
    record.liked ??
    record.liked_by_user ??
    record.current_user_liked;

  return {
    id: asNumber(record.id, index + 1),
    author: asString(
      record.user_full_name ??
        record.author ??
        record.name ??
        record.user_name ??
        record.user,
      "Гість",
    ),
    userAvatar: resolveImageUrl(record.user_avatar ?? record.avatar, ""),
    text: asString(record.text ?? record.comment ?? record.body),
    likesCount: asNumber(record.likes_count ?? record.likesCount, 0),
    isLiked: typeof isLiked === "boolean" ? isLiked : false,
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

  const id = asNumber(record.id, fallback.id || index + 1);

  return {
    id,
    slug,
    title_ua: titleUa,
    title_en: titleEn,
    image: resolveImageUrl(
      record.image ?? record.photo,
      staticCategoryImages[slug] || fallback.image,
    ),
  };
};

const normalizeEvent = (raw: unknown, index: number): EventItem => {
  const fallback = fallbackEvents[index % fallbackEvents.length];
  const record = asRecord(raw);
  if (!record) return fallback;

  const category = record.category;
  const categoryRecord = asRecord(category);
  const categoryId = asNumber(
    record.category_id ?? categoryRecord?.id ?? category,
    fallback.categoryId || 0,
  );
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
  const id = asNumber(record.id, fallback.id || index + 1);
  const baseLikesCount = asNumber(
    record.likes_count ?? record.likesCount,
    fallback.likesCount || 0,
  );
  const storedReaction = readStoredEventReaction(id);
  const localLiked = readStoredLikedEventIds().has(id);
  const isLiked = storedReaction?.liked ?? hasCurrentUserLike(record, id);
  const likesCount =
    storedReaction?.likesCount ??
    (localLiked && baseLikesCount === 0 ? 1 : baseLikesCount);

  return {
    id,
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
    categoryId: categoryId || undefined,
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
    likesCount,
    isLiked,
    commentsCount: asNumber(
      record.comments_count ?? record.commentsCount,
      fallback.commentsCount ?? fallback.comments.length,
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
  const response = await apiFetch(url, options);
  const data = await response.json().catch(() => null);
  return { response, data };
};

const getUrlBase = () =>
  typeof window === "undefined" ? "http://localhost" : window.location.origin;

const createEndpointUrl = (url: string) => new URL(url, getUrlBase());

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

const hasAccessToken = () =>
  typeof window !== "undefined" && Boolean(localStorage.getItem("accessToken"));

const parseToggleResult = (
  data: unknown,
  enabledDetail: string,
  fallbackLiked = true,
): ToggleResult => {
  const record = asRecord(data);
  const explicitValue =
    record?.liked ??
    record?.is_liked ??
    record?.isLiked ??
    record?.current_user_liked ??
    record?.currentUserLiked;

  if (typeof explicitValue === "boolean") {
    return { liked: explicitValue };
  }

  const detail = asString(record?.detail ?? record?.message).toLowerCase();
  if (!detail) return { liked: fallbackLiked };

  if (
    detail.includes("unliked") ||
    detail.includes("removed") ||
    detail.includes("deleted") ||
    detail.includes("disliked")
  ) {
    return { liked: false };
  }

  if (detail.includes(enabledDetail) || detail.includes("liked")) {
    return { liked: true };
  }

  return { liked: fallbackLiked };
};

const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const LOCAL_DATE_INPUT_PATTERN = /^(\d{2})\.(\d{2})\.(\d{4})$/;
const allowedEventExperience = new Set([
  "parents",
  "teacher",
  "psychologist",
  "trauma_pedagogy",
  "social_worker",
  "other",
]);

const normalizeBirthDate = (value: string) => {
  const cleanValue = value.trim();
  if (DATE_INPUT_PATTERN.test(cleanValue)) return cleanValue;

  const localMatch = cleanValue.match(LOCAL_DATE_INPUT_PATTERN);
  if (localMatch) {
    const [, day, month, year] = localMatch;
    return `${year}-${month}-${day}`;
  }

  return cleanValue;
};

const normalizeGender = (value: string) => {
  const cleanValue = value.trim().toLowerCase();
  const maleValues = new Set([
    "male",
    "man",
    "m",
    "\u0447\u043e\u043b\u043e\u0432\u0456\u043a",
    "\u0447\u043e\u043b\u043e\u0432\u0438\u043a",
    "\u0447\u043e\u043b",
    "\u043c\u0443\u0436\u0447\u0438\u043d\u0430",
  ]);
  const femaleValues = new Set([
    "female",
    "woman",
    "f",
    "\u0436\u0456\u043d\u043a\u0430",
    "\u0436\u0438\u043d\u043a\u0430",
    "\u0436\u0456\u043d",
    "\u0436\u0435\u043d\u0449\u0438\u043d\u0430",
  ]);
  const otherValues = new Set([
    "other",
    "\u0456\u043d\u0448\u0435",
    "\u0456\u043d\u0448\u0438\u0439",
    "\u0434\u0440\u0443\u0433\u0435",
    "\u0456\u043d\u0448\u0430",
    "\u0456\u043d\u0448",
  ]);

  if (maleValues.has(cleanValue)) return "male";
  if (femaleValues.has(cleanValue)) return "female";
  if (otherValues.has(cleanValue)) return "other";

  return "other";
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

export async function createEventCategory(payload: CreateEventCategoryPayload) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Authentication required");
  }

  const formData = new FormData();
  formData.append("name", payload.name.trim());
  formData.append("image", payload.image);

  const response = await apiFetch(endpoints.eventCategories, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const record = asRecord(data);
    const message =
      asString(record?.detail) ||
      asString(record?.name) ||
      asString(record?.image) ||
      "Failed to create event category";

    throw new Error(message);
  }

  return normalizeCategory(data, 0);
}

export async function createEvent(payload: CreateEventPayload) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Authentication required");
  }

  const formData = new FormData();
  formData.append("title", payload.title.trim());
  formData.append("description", payload.description.trim());
  formData.append("category", String(payload.category));
  payload.images.forEach((image) => {
    formData.append("images", image);
  });

  const response = await apiFetch(endpoints.events, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const record = asRecord(data);
    const fieldMessage = record
      ? Object.values(record)
          .flatMap((value) => (Array.isArray(value) ? value : [value]))
          .map((value) => asString(value))
          .find(Boolean)
      : "";
    const message =
      asString(record?.detail) || fieldMessage || "Failed to create event";

    throw new Error(message);
  }

  return normalizeEvent(data, 0);
}

export async function getEvents(): Promise<EventItem[]> {
  try {
    const url = createEndpointUrl(endpoints.events);
    url.searchParams.set("ordering", "-created_at");

    const { response, data } = await requestJson(
      url.toString(),
      hasAccessToken() ? { headers: authHeaders() } : undefined,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }

    const rawEvents = extractList(data, ["results", "events", "data"]);
    const events = rawEvents.length
      ? rawEvents.map(normalizeEvent)
      : applyStoredEventReactions(fallbackEvents);

    return events.sort((a, b) => {
      const byDate = getSortTime(b) - getSortTime(a);
      return byDate || b.id - a.id;
    });
  } catch (error) {
    console.error(error);
    return applyStoredEventReactions(fallbackEvents);
  }
}

export async function getEventsByCategory(categorySlug: string) {
  const fallback = fallbackEvents.filter(
    (event) => event.categorySlug === categorySlug,
  );

  try {
    const categories = await getEventCategories();
    const category = categories.find((item) => item.slug === categorySlug);
    const url = createEndpointUrl(endpoints.events);
    url.searchParams.set("category", String(category?.id ?? categorySlug));

    const { response, data } = await requestJson(
      url.toString(),
      hasAccessToken() ? { headers: authHeaders() } : undefined,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch category events");
    }

    const rawEvents = extractList(data, ["results", "events", "data"]);
    const events = rawEvents.length
      ? rawEvents.map(normalizeEvent)
      : applyStoredEventReactions(fallback);

    return events.sort((a, b) => {
      const byDate = getSortTime(b) - getSortTime(a);
      return byDate || b.id - a.id;
    });
  } catch (error) {
    console.error(error);
    return applyStoredEventReactions(fallback);
  }
}

export async function getEvent(id: string | number): Promise<EventItem | null> {
  try {
    const { response, data } = await requestJson(
      endpoints.eventDetail(id),
      hasAccessToken() ? { headers: authHeaders() } : undefined,
    );

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
  if (!hasAccessToken()) {
    throw new Error("Authentication required");
  }

  const text = payload.text.trim().slice(0, 1000);

  if (text.length < 2) {
    throw new Error("Invalid comment");
  }

  const { response, data } = await requestJson(endpoints.eventComments(eventId), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("Failed to create comment");
  }

  return normalizeComment(data, 0);
}

export async function toggleEventLike(
  eventId: string | number,
  fallbackLiked = true,
  localOnly = false,
  fallbackLikesCount?: number,
) {
  if (localOnly) {
    syncStoredEventLike(eventId, fallbackLiked, fallbackLikesCount);
    return { liked: fallbackLiked };
  }

  if (!hasAccessToken()) {
    throw new Error("Authentication required");
  }

  try {
    const { response, data } = await requestJson(endpoints.eventLike(eventId), {
      method: "POST",
      headers: authHeaders(),
    });

    if (!response.ok) {
      syncStoredEventLike(eventId, fallbackLiked, fallbackLikesCount);
      return { liked: fallbackLiked };
    }

    const result = parseToggleResult(data, "event liked", fallbackLiked);
    syncStoredEventLike(eventId, result.liked, fallbackLikesCount);
    return result;
  } catch {
    syncStoredEventLike(eventId, fallbackLiked, fallbackLikesCount);
    return { liked: fallbackLiked };
  }
}

export async function getFavoriteEvents(): Promise<EventItem[]> {
  if (!hasAccessToken()) return [];

  const events = await getEvents();
  const localLikedIds = readStoredLikedEventIds();

  return events.filter((event) => event.isLiked || localLikedIds.has(event.id));
}

export async function toggleCommentLike(
  eventId: string | number,
  commentId: string | number,
) {
  if (!hasAccessToken()) {
    throw new Error("Authentication required");
  }

  const { response, data } = await requestJson(
    endpoints.eventCommentLike(eventId, commentId),
    {
      method: "POST",
      headers: authHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to toggle comment like");
  }

  return parseToggleResult(data, "comment liked");
}

export async function registerForEvent(
  eventId: string | number,
  payload: EventRegistrationPayload,
): Promise<EventRegistrationResult> {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    return { status: "error" };
  }

  const cleanPayload: EventRegistrationPayload = {
    full_name: payload.full_name.trim().slice(0, 120),
    birth_date: normalizeBirthDate(payload.birth_date),
    gender: normalizeGender(payload.gender),
    email: payload.email.trim().slice(0, 160),
    phone: payload.phone.trim().slice(0, 40),
    experience: payload.experience.trim(),
    eating_meat: Boolean(payload.eating_meat),
    is_agreed: Boolean(payload.is_agreed),
  };

  if (
    !cleanPayload.full_name ||
    !DATE_INPUT_PATTERN.test(cleanPayload.birth_date) ||
    !cleanPayload.gender ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanPayload.email) ||
    cleanPayload.phone.length < 7 ||
    !allowedEventExperience.has(cleanPayload.experience) ||
    !cleanPayload.is_agreed
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
