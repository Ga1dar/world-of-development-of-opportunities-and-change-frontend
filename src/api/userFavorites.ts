import type { EducationArticle, EducationVideo } from "./educationMaterials";
import type { EventItem } from "./events";
import { apiFetch, getAccessToken } from "./auth";
import { endpoints } from "./endpoints";

export type FavoriteContentKind = "event" | "article" | "video";

export type FavoriteContentItem = {
  key: string;
  kind: FavoriteContentKind;
  id: string;
  slug: string;
  title: string;
  description: string;
  href: string;
  likesCount: number;
  commentsCount: number;
  favoritesCount?: number;
  date?: string;
  savedByFavorite?: boolean;
  userKeys?: string[];
};

export const FAVORITES_CHANGED_EVENT = "svity-favorites-changed";

const STORAGE_KEY = "svityFavoriteContentItems";

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

const asString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : typeof value === "number" ? String(value) : fallback;

const asNumber = (value: unknown, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const stripHtml = (value: string) =>
  value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const readLocalizedString = (
  record: Record<string, unknown>,
  baseKey: string,
  language: "ua" | "en",
) =>
  asString(record[`${baseKey}_${language}`]) ||
  asString(record[language === "ua" ? `${baseKey}_uk` : `${baseKey}_en`]) ||
  asString(record[baseKey]);

const normalizeUserKey = (value: unknown) => asString(value).trim().toLowerCase();

const uniqueStrings = (values: string[]) =>
  values.filter((value, index) => value && values.indexOf(value) === index);

const parseJwtPayload = (token: string) => {
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

const getCurrentUserKeys = () => {
  if (typeof window === "undefined") return [];

  const currentUser = (() => {
    try {
      return asRecord(JSON.parse(localStorage.getItem("currentUser") || "null"));
    } catch {
      return null;
    }
  })();
  const tokenPayload = parseJwtPayload(localStorage.getItem("accessToken") || "");

  return uniqueStrings([
    normalizeUserKey(currentUser?.id),
    normalizeUserKey(currentUser?.pk),
    normalizeUserKey(currentUser?.user_id),
    normalizeUserKey(currentUser?.userId),
    normalizeUserKey(currentUser?.email),
    normalizeUserKey(currentUser?.username),
    normalizeUserKey(tokenPayload?.user_id),
    normalizeUserKey(tokenPayload?.userId),
    normalizeUserKey(tokenPayload?.id),
    normalizeUserKey(tokenPayload?.email),
    normalizeUserKey(tokenPayload?.username),
    normalizeUserKey(tokenPayload?.sub),
  ]);
};

const asStringArray = (value: unknown) =>
  Array.isArray(value) ? uniqueStrings(value.map(normalizeUserKey)) : [];

const itemKey = (kind: FavoriteContentKind, id: string | number) => `${kind}:${id}`;

const itemIdentity = (item: FavoriteContentItem) =>
  `${item.kind}:${item.href || item.slug || item.id}`.toLowerCase();

const storedItemIdentity = (item: FavoriteContentItem) =>
  `${itemIdentity(item)}:${item.userKeys?.join("|") || "legacy"}`;

const notifyFavoritesChanged = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
  }
};

const belongsToCurrentUser = (item: FavoriteContentItem, currentUserKeys: string[]) =>
  !item.userKeys?.length ||
  currentUserKeys.some((currentUserKey) => item.userKeys?.includes(currentUserKey));

const readAllFavoriteContentItems = (): FavoriteContentItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(value)) return [];

    const byIdentity = new Map<string, FavoriteContentItem>();

    value
      .map<FavoriteContentItem | null>((item) => {
        const record = asRecord(item);
        if (!record) return null;

        const kind = asString(record.kind) as FavoriteContentKind;
        if (!["event", "article", "video"].includes(kind)) return null;

        const id = asString(record.id);
        const title = asString(record.title);
        const href = asString(record.href);
        if (!id || !title || !href) return null;

        const favoriteItem: FavoriteContentItem = {
          key: asString(record.key, itemKey(kind, id)),
          kind,
          id,
          slug: asString(record.slug, id),
          title,
          description: asString(record.description),
          href,
          likesCount: asNumber(record.likesCount),
          commentsCount: asNumber(record.commentsCount),
          favoritesCount: asNumber(record.favoritesCount),
          date: asString(record.date),
          savedByFavorite: record.savedByFavorite === true,
          userKeys: asStringArray(record.userKeys),
        };

        return favoriteItem;
      })
      .filter((item): item is FavoriteContentItem => Boolean(item))
      .forEach((item) => {
        byIdentity.set(storedItemIdentity(item), item);
      });

    return Array.from(byIdentity.values());
  } catch {
    return [];
  }
};

export const readFavoriteContentItems = (): FavoriteContentItem[] => {
  const currentUserKeys = getCurrentUserKeys();

  return readAllFavoriteContentItems().filter(
    (item) => item.savedByFavorite === true && belongsToCurrentUser(item, currentUserKeys),
  );
};

const writeFavoriteContentItems = (items: FavoriteContentItem[]) => {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  notifyFavoritesChanged();
};

export const clearFavoriteContentItems = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STORAGE_KEY);
  notifyFavoritesChanged();
};

export const syncFavoriteContentItem = (
  item: FavoriteContentItem,
  isFavorite: boolean,
) => {
  const items = readAllFavoriteContentItems();
  const key = item.key || itemKey(item.kind, item.id);
  const currentUserKeys = getCurrentUserKeys();
  const nextItem = {
    ...item,
    key,
    savedByFavorite: isFavorite,
    userKeys: uniqueStrings([...(item.userKeys ?? []), ...currentUserKeys]),
  };
  const identity = itemIdentity(nextItem);
  const existingIndex = items.findIndex(
    (current) =>
      (current.key === key || itemIdentity(current) === identity) &&
      belongsToCurrentUser(current, currentUserKeys),
  );

  if (isFavorite) {
    if (existingIndex >= 0) items[existingIndex] = nextItem;
    else items.unshift(nextItem);
    writeFavoriteContentItems(items);
    return;
  }

  if (existingIndex >= 0) {
    items.splice(existingIndex, 1);
    writeFavoriteContentItems(items);
  }
};

export const mergeFavoriteContentItems = (
  ...groups: FavoriteContentItem[][]
) => {
  const byIdentity = new Map<string, FavoriteContentItem>();

  groups.flat().forEach((item) => {
    byIdentity.set(itemIdentity(item), item);
  });

  return Array.from(byIdentity.values());
};

const extractFavoriteList = (data: unknown, key: "events" | "articles" | "videos") => {
  const record = asRecord(data);
  if (!record) return [];

  const value = record[key];
  if (Array.isArray(value)) {
    return value.filter((item): item is Record<string, unknown> => Boolean(asRecord(item)));
  }

  const nestedRecord = asRecord(value);
  const results = nestedRecord?.results ?? nestedRecord?.data;
  return Array.isArray(results)
    ? results.filter((item): item is Record<string, unknown> => Boolean(asRecord(item)))
    : [];
};

const normalizeServerFavoriteEvent = (
  raw: Record<string, unknown>,
  language: "ua" | "en",
  index: number,
): FavoriteContentItem => {
  const id = asString(raw.id, String(index + 1));
  const slug = asString(raw.slug, id);
  const category = asRecord(raw.category);
  const categorySlug =
    asString(raw.category_slug ?? raw.categorySlug) ||
    asString(category?.slug) ||
    "favorites";
  const title =
    readLocalizedString(raw, "title", language) ||
    asString(raw.name) ||
    `Event ${index + 1}`;
  const descriptionSource =
    readLocalizedString(raw, "short_description", language) ||
    readLocalizedString(raw, "description", language) ||
    asString(raw.content);

  return {
    key: itemKey("event", id),
    kind: "event",
    id,
    slug,
    title,
    description: stripHtml(descriptionSource),
    href: `/events/${categorySlug}/${id}`,
    likesCount: asNumber(raw.likes_count ?? raw.likesCount),
    commentsCount: asNumber(raw.comments_count ?? raw.commentsCount),
    favoritesCount: asNumber(raw.favorites_count ?? raw.favoritesCount),
    date: asString(raw.event_date ?? raw.eventDate ?? raw.published_at ?? raw.created_at),
    savedByFavorite: true,
    userKeys: getCurrentUserKeys(),
  };
};

const normalizeServerFavoriteArticle = (
  raw: Record<string, unknown>,
  language: "ua" | "en",
  index: number,
): FavoriteContentItem => {
  const id = asString(raw.id, String(index + 1));
  const slug = asString(raw.slug, id);
  const title =
    readLocalizedString(raw, "title", language) ||
    asString(raw.name) ||
    `Article ${index + 1}`;
  const descriptionSource =
    readLocalizedString(raw, "short_description", language) ||
    readLocalizedString(raw, "description", language) ||
    readLocalizedString(raw, "content", language);

  return {
    key: itemKey("article", id || slug),
    kind: "article",
    id: id || slug,
    slug,
    title,
    description: stripHtml(descriptionSource),
    href: `/materials/articles/${slug}`,
    likesCount: asNumber(raw.likes_count ?? raw.likesCount),
    commentsCount: asNumber(raw.comments_count ?? raw.commentsCount),
    favoritesCount: asNumber(raw.favorites_count ?? raw.favoritesCount),
    date: asString(raw.published_at ?? raw.publishedAt ?? raw.created_at ?? raw.createdAt),
    savedByFavorite: true,
    userKeys: getCurrentUserKeys(),
  };
};

const normalizeServerFavoriteVideo = (
  raw: Record<string, unknown>,
  language: "ua" | "en",
  index: number,
): FavoriteContentItem => {
  const id = asString(raw.id, String(index + 1));
  const slug = asString(raw.slug, id);
  const title =
    readLocalizedString(raw, "title", language) ||
    asString(raw.name) ||
    `Video ${index + 1}`;
  const descriptionSource =
    readLocalizedString(raw, "short_description", language) ||
    readLocalizedString(raw, "description", language) ||
    readLocalizedString(raw, "content", language);

  return {
    key: itemKey("video", id || slug),
    kind: "video",
    id: id || slug,
    slug,
    title,
    description: stripHtml(descriptionSource),
    href: `/materials/videos/${slug}`,
    likesCount: asNumber(raw.likes_count ?? raw.likesCount),
    commentsCount: asNumber(raw.comments_count ?? raw.commentsCount),
    favoritesCount: asNumber(raw.favorites_count ?? raw.favoritesCount),
    date: asString(raw.published_at ?? raw.publishedAt ?? raw.created_at ?? raw.createdAt),
    savedByFavorite: true,
    userKeys: getCurrentUserKeys(),
  };
};

export const getCurrentUserFavoriteContentItems = async (
  language: "ua" | "en",
) => {
  const accessToken = getAccessToken();
  if (!accessToken) return [];

  const response = await apiFetch(endpoints.userFavorites, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Favorites request failed: ${response.status}`);
  }

  const data = await response.json().catch(() => null);
  const events = extractFavoriteList(data, "events").map((item, index) =>
    normalizeServerFavoriteEvent(item, language, index),
  );
  const articles = extractFavoriteList(data, "articles").map((item, index) =>
    normalizeServerFavoriteArticle(item, language, index),
  );
  const videos = extractFavoriteList(data, "videos").map((item, index) =>
    normalizeServerFavoriteVideo(item, language, index),
  );

  return [...events, ...articles, ...videos];
};

export const eventToFavoriteContentItem = (
  event: EventItem,
  language: "ua" | "en",
): FavoriteContentItem => ({
  key: itemKey("event", event.id),
  kind: "event",
  id: String(event.id),
  slug: event.slug,
  title: language === "en" ? event.title_en : event.title_ua,
  description:
    (language === "en" ? event.description_en : event.description_ua)[0] || "",
  href: `/events/${event.categorySlug}/${event.id}`,
  likesCount: event.likesCount || 0,
  commentsCount: event.commentsCount ?? event.comments.length,
  date: event.eventDate || event.createdAt,
});

export const articleToFavoriteContentItem = (
  article: EducationArticle,
): FavoriteContentItem => ({
  key: itemKey("article", article.id || article.slug),
  kind: "article",
  id: article.id || article.slug,
  slug: article.slug,
  title: article.title,
  description: article.description,
  href: `/materials/articles/${article.slug}`,
  likesCount: article.likesCount,
  commentsCount: article.commentsCount,
  favoritesCount: article.favoritesCount,
  date: article.publishedAt,
});

export const videoToFavoriteContentItem = (
  video: EducationVideo,
): FavoriteContentItem => ({
  key: itemKey("video", video.id || video.slug),
  kind: "video",
  id: video.id || video.slug,
  slug: video.slug,
  title: video.title,
  description: video.description,
  href: `/materials/videos/${video.slug}`,
  likesCount: video.likesCount,
  commentsCount: video.commentsCount,
  favoritesCount: video.favoritesCount,
  date: video.publishedAt,
});
