import type { EducationArticle, EducationVideo } from "./educationMaterials";
import type { EventItem } from "./events";

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

const itemKey = (kind: FavoriteContentKind, id: string | number) => `${kind}:${id}`;

const itemIdentity = (item: FavoriteContentItem) =>
  `${item.kind}:${item.href || item.slug || item.id}`.toLowerCase();

const notifyFavoritesChanged = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
  }
};

export const readFavoriteContentItems = (): FavoriteContentItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(value)) return [];

    return mergeFavoriteContentItems(
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
        };

        return favoriteItem;
      })
      .filter((item): item is FavoriteContentItem => Boolean(item)),
    );
  } catch {
    return [];
  }
};

const writeFavoriteContentItems = (items: FavoriteContentItem[]) => {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(mergeFavoriteContentItems(items)));
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
  const items = readFavoriteContentItems();
  const key = item.key || itemKey(item.kind, item.id);
  const nextItem = { ...item, key };
  const identity = itemIdentity(nextItem);
  const existingIndex = items.findIndex(
    (current) => current.key === key || itemIdentity(current) === identity,
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
