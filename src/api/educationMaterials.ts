import { API_URL } from "./client";
import { endpoints } from "./endpoints";
import { apiFetch, getAccessToken } from "./auth";

type RawRecord = Record<string, unknown>;

export type EducationArticle = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  sections: EducationArticleSection[];
  coverImage: string;
  publishedAt: string;
  likesCount: number;
  commentsCount: number;
  favoritesCount: number;
  isLiked: boolean;
  isFavorite: boolean;
};

export type EducationArticleSection = {
  id: string;
  slug: string;
  title: string;
  content: string;
  order: number;
};

export type EducationArticleComment = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
};

export type EducationVideo = {
  id: string;
  slug: string;
  title: string;
  description: string;
  videoUrl: string;
  coverImage: string;
  publishedAt: string;
  likesCount: number;
  commentsCount: number;
  favoritesCount: number;
  isLiked: boolean;
  isFavorite: boolean;
};

export type CreateEducationArticlePayload = {
  title: string;
  content: string;
  publishedAt?: string;
  coverImage?: File | null;
};

export type CreateEducationVideoPayload = {
  title: string;
  description?: string;
  publishedAt?: string;
  videoFile: File;
};

const asRecord = (value: unknown): RawRecord | null =>
  value && typeof value === "object" ? (value as RawRecord) : null;

const asString = (value: unknown, fallback = "") => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
};

const asNumber = (value: unknown, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const asBoolean = (value: unknown) =>
  value === true || value === "true" || value === 1 || value === "1";

const asOptionalBoolean = (value: unknown, fallback: boolean) => {
  if (value === undefined || value === null || value === "") return fallback;
  return asBoolean(value);
};

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const extractList = (data: unknown): RawRecord[] => {
  if (Array.isArray(data)) {
    return data.filter((item): item is RawRecord => Boolean(asRecord(item)));
  }

  const record = asRecord(data);
  if (!record) return [];

  const items = record.results ?? record.data ?? record.articles ?? record.videos;
  return Array.isArray(items)
    ? items.filter((item): item is RawRecord => Boolean(asRecord(item)))
    : [];
};

const getApiOrigin = () => {
  try {
    return API_URL ? new URL(API_URL).origin : "";
  } catch {
    return "";
  }
};

const resolveMediaUrl = (value: unknown, fallback = "") => {
  const path = asString(value);
  if (!path) return fallback;
  if (/^https?:\/\//i.test(path)) return path;

  const apiOrigin = getApiOrigin();
  if (apiOrigin && (path.startsWith("/media") || path.startsWith("/uploads"))) {
    return `${apiOrigin}${path}`;
  }

  return path.startsWith("/") ? path : apiOrigin ? new URL(path, `${apiOrigin}/`).toString() : path;
};

const readLocalizedString = (record: RawRecord, baseKey: string, language: "ua" | "en") =>
  asString(record[`${baseKey}_${language}`]) ||
  asString(record[language === "ua" ? `${baseKey}_uk` : `${baseKey}_en`]) ||
  asString(record[baseKey]);

const normalizePublishedAt = (record: RawRecord) =>
  asString(record.published_at ?? record.publishedAt ?? record.created_at ?? record.createdAt);

const sortLatest = <T extends { publishedAt: string }>(items: T[]) =>
  [...items].sort((first, second) => {
    const firstTime = Date.parse(first.publishedAt);
    const secondTime = Date.parse(second.publishedAt);

    return (Number.isNaN(secondTime) ? 0 : secondTime) - (Number.isNaN(firstTime) ? 0 : firstTime);
  });

const normalizeSection = (
  raw: RawRecord,
  language: "ua" | "en",
  index: number,
): EducationArticleSection => ({
  id: asString(raw.id, String(index + 1)),
  slug: asString(raw.slug, `section-${index + 1}`),
  title: readLocalizedString(raw, "title", language),
  content: readLocalizedString(raw, "content", language),
  order: asNumber(raw.order, index),
});

const normalizeSections = (raw: RawRecord, language: "ua" | "en") => {
  const rawSections = raw.sections ?? raw.article_sections ?? raw.articleSections;

  if (!Array.isArray(rawSections)) return [];

  return rawSections
    .filter((item): item is RawRecord => Boolean(asRecord(item)))
    .map((section, index) => normalizeSection(section, language, index))
    .sort((first, second) => first.order - second.order);
};

const normalizeArticle = (raw: RawRecord, language: "ua" | "en", index: number): EducationArticle => {
  const title = readLocalizedString(raw, "title", language) || `Article ${index + 1}`;
  const content = readLocalizedString(raw, "content", language);
  const sections = normalizeSections(raw, language);
  const description =
    readLocalizedString(raw, "short_description", language) ||
    readLocalizedString(raw, "description", language) ||
    stripHtml(content) ||
    stripHtml(sections.map((section) => section.content).join(" "));

  return {
    id: asString(raw.id, String(index + 1)),
    slug: asString(raw.slug, asString(raw.id, String(index + 1))),
    title,
    description,
    content,
    sections,
    coverImage: resolveMediaUrl(raw.cover_image ?? raw.coverImage ?? raw.image),
    publishedAt: normalizePublishedAt(raw),
    likesCount: asNumber(raw.likes_count ?? raw.likesCount),
    commentsCount: asNumber(raw.comments_count ?? raw.commentsCount),
    favoritesCount: asNumber(raw.favorites_count ?? raw.favoritesCount),
    isLiked: asBoolean(raw.is_liked ?? raw.isLiked ?? raw.liked),
    isFavorite: asBoolean(raw.is_favorite ?? raw.isFavorite ?? raw.favorite),
  };
};

const normalizeVideo = (raw: RawRecord, language: "ua" | "en", index: number): EducationVideo => {
  const title = readLocalizedString(raw, "title", language) || `Video ${index + 1}`;
  const description =
    readLocalizedString(raw, "short_description", language) ||
    readLocalizedString(raw, "description", language) ||
    stripHtml(readLocalizedString(raw, "content", language));

  return {
    id: asString(raw.id, String(index + 1)),
    slug: asString(raw.slug, asString(raw.id, String(index + 1))),
    title,
    description,
    videoUrl: resolveMediaUrl(raw.video_file ?? raw.videoFile ?? raw.video ?? raw.file),
    coverImage: resolveMediaUrl(raw.cover_image ?? raw.coverImage ?? raw.thumbnail ?? raw.preview),
    publishedAt: normalizePublishedAt(raw),
    likesCount: asNumber(raw.likes_count ?? raw.likesCount),
    commentsCount: asNumber(raw.comments_count ?? raw.commentsCount),
    favoritesCount: asNumber(raw.favorites_count ?? raw.favoritesCount),
    isLiked: asBoolean(raw.is_liked ?? raw.isLiked ?? raw.liked),
    isFavorite: asBoolean(raw.is_favorite ?? raw.isFavorite ?? raw.favorite),
  };
};

const fetchJson = async (url: string, signal?: AbortSignal) => {
  const accessToken = getAccessToken();
  const response = await apiFetch(url, {
    signal,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json().catch(() => null);
};

const postJson = async (url: string, body?: unknown) => {
  const accessToken = getAccessToken();
  const response = await apiFetch(url, {
    method: "POST",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json().catch(() => null);
};

const readErrorMessage = async (response: Response) => {
  const data = await response.json().catch(() => null);
  const record = asRecord(data);

  if (!record) return `Request failed: ${response.status}`;

  const detail = asString(record.detail);
  if (detail) return detail;

  return Object.entries(record)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : asString(value)}`)
    .filter(Boolean)
    .join("; ") || `Request failed: ${response.status}`;
};

const postFormData = async (url: string, body: FormData) => {
  const accessToken = getAccessToken();
  const response = await apiFetch(url, {
    method: "POST",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    body,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json().catch(() => null);
};

export async function getLatestEducationArticles(
  language: "ua" | "en",
  limit = 2,
  signal?: AbortSignal,
) {
  try {
    const data = await fetchJson(endpoints.educationArticles, signal);
    return sortLatest(extractList(data).map((item, index) => normalizeArticle(item, language, index))).slice(0, limit);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    console.error(error);
    return [];
  }
}

export async function getEducationArticles(language: "ua" | "en", signal?: AbortSignal) {
  try {
    const data = await fetchJson(endpoints.educationArticles, signal);
    return sortLatest(
      extractList(data).map((item, index) => normalizeArticle(item, language, index)),
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    console.error(error);
    return [];
  }
}

export async function getEducationArticle(
  slug: string,
  language: "ua" | "en",
  signal?: AbortSignal,
) {
  try {
    const data = await fetchJson(endpoints.educationArticle(slug), signal);
    const record = asRecord(data);
    return record ? normalizeArticle(record, language, 0) : null;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    console.error(error);
    return null;
  }
}

export async function toggleEducationArticleLike(
  slug: string,
  fallbackLiked = true,
  fallbackLikesCount = 0,
) {
  const data = await postJson(endpoints.educationArticleLike(slug));
  const record = asRecord(data);

  return {
    likesCount: record
      ? asNumber(record.likes_count ?? record.likesCount, fallbackLikesCount)
      : fallbackLikesCount,
    isLiked: record
      ? asOptionalBoolean(record.liked ?? record.is_liked ?? record.isLiked, fallbackLiked)
      : fallbackLiked,
  };
}

export async function toggleEducationArticleFavorite(
  slug: string,
  fallbackFavorite = true,
  fallbackFavoritesCount = 0,
) {
  const data = await postJson(endpoints.educationArticleFavorite(slug));
  const record = asRecord(data);

  return {
    favoritesCount: record
      ? asNumber(record.favorites_count ?? record.favoritesCount, fallbackFavoritesCount)
      : fallbackFavoritesCount,
    isFavorite: record
      ? asOptionalBoolean(
          record.favorite ?? record.is_favorite ?? record.isFavorite,
          fallbackFavorite,
        )
      : fallbackFavorite,
  };
}

const normalizeArticleComment = (raw: RawRecord, index: number): EducationArticleComment => {
  const authorRecord = asRecord(raw.author) ?? asRecord(raw.user);
  const authorName =
    asString(raw.author_name ?? raw.authorName) ||
    asString(authorRecord?.full_name ?? authorRecord?.name ?? authorRecord?.email) ||
    "Користувач";

  return {
    id: asString(raw.id, String(index + 1)),
    author: authorName,
    text: asString(raw.text ?? raw.content ?? raw.body),
    createdAt: asString(raw.created_at ?? raw.createdAt),
    likesCount: asNumber(raw.likes_count ?? raw.likesCount),
    isLiked: asBoolean(raw.is_liked ?? raw.isLiked ?? raw.liked),
  };
};

const normalizeVideoComment = normalizeArticleComment;

export async function getEducationArticleComments(slug: string, signal?: AbortSignal) {
  try {
    const data = await fetchJson(endpoints.educationArticleComments(slug), signal);
    return extractList(data).map((item, index) => normalizeArticleComment(item, index));
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    console.error(error);
    return [];
  }
}

export async function createEducationArticleComment(slug: string, text: string) {
  const data = await postJson(endpoints.educationArticleComments(slug), { text });
  const record = asRecord(data);
  return record ? normalizeArticleComment(record, 0) : null;
}

export async function createEducationArticle(
  payload: CreateEducationArticlePayload,
  language: "ua" | "en",
) {
  const content = payload.content.trim();
  const body = new FormData();

  body.append("title", payload.title.trim());
  body.append("content", content);
  body.append("short_description", stripHtml(content).slice(0, 180));
  body.append("status", "published");
  body.append(
    "sections",
    JSON.stringify([{ title: payload.title.trim(), content, order: 1 }]),
  );

  if (payload.publishedAt) {
    body.append("published_at", payload.publishedAt);
  }

  if (payload.coverImage) {
    body.append("cover_image", payload.coverImage);
  }

  const data = await postFormData(endpoints.educationArticles, body);
  const record = asRecord(data);

  return record ? normalizeArticle(record, language, 0) : null;
}

export async function createEducationVideo(
  payload: CreateEducationVideoPayload,
  language: "ua" | "en",
) {
  const description = payload.description?.trim() ?? "";
  const body = new FormData();

  body.append("title", payload.title.trim());
  body.append("short_description", description);
  body.append("content", description);
  body.append("status", "published");
  body.append("video_file", payload.videoFile);

  if (payload.publishedAt) {
    body.append("published_at", payload.publishedAt);
  }

  const data = await postFormData(endpoints.educationVideos, body);
  const record = asRecord(data);

  return record ? normalizeVideo(record, language, 0) : null;
}

export async function getLatestEducationVideos(
  language: "ua" | "en",
  limit = 3,
  signal?: AbortSignal,
) {
  try {
    const data = await fetchJson(endpoints.educationVideos, signal);
    return sortLatest(extractList(data).map((item, index) => normalizeVideo(item, language, index))).slice(0, limit);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    console.error(error);
    return [];
  }
}

export async function getEducationVideos(language: "ua" | "en", signal?: AbortSignal) {
  try {
    const data = await fetchJson(endpoints.educationVideos, signal);
    return sortLatest(
      extractList(data).map((item, index) => normalizeVideo(item, language, index)),
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    console.error(error);
    return [];
  }
}

export async function getEducationVideo(
  slug: string,
  language: "ua" | "en",
  signal?: AbortSignal,
) {
  try {
    const data = await fetchJson(endpoints.educationVideo(slug), signal);
    const record = asRecord(data);
    return record ? normalizeVideo(record, language, 0) : null;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    console.error(error);
    return null;
  }
}

export async function toggleEducationVideoLike(
  slug: string,
  fallbackLiked = true,
  fallbackLikesCount = 0,
) {
  const data = await postJson(endpoints.educationVideoLike(slug));
  const record = asRecord(data);

  return {
    likesCount: record
      ? asNumber(record.likes_count ?? record.likesCount, fallbackLikesCount)
      : fallbackLikesCount,
    isLiked: record
      ? asOptionalBoolean(record.liked ?? record.is_liked ?? record.isLiked, fallbackLiked)
      : fallbackLiked,
  };
}

export async function toggleEducationVideoFavorite(
  slug: string,
  fallbackFavorite = true,
  fallbackFavoritesCount = 0,
) {
  const data = await postJson(endpoints.educationVideoFavorite(slug));
  const record = asRecord(data);

  return {
    favoritesCount: record
      ? asNumber(record.favorites_count ?? record.favoritesCount, fallbackFavoritesCount)
      : fallbackFavoritesCount,
    isFavorite: record
      ? asOptionalBoolean(
          record.favorite ?? record.is_favorite ?? record.isFavorite,
          fallbackFavorite,
        )
      : fallbackFavorite,
  };
}

export async function getEducationVideoComments(slug: string, signal?: AbortSignal) {
  try {
    const data = await fetchJson(endpoints.educationVideoComments(slug), signal);
    return extractList(data).map((item, index) => normalizeVideoComment(item, index));
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    console.error(error);
    return [];
  }
}

export async function createEducationVideoComment(slug: string, text: string) {
  const data = await postJson(endpoints.educationVideoComments(slug), { text });
  const record = asRecord(data);
  return record ? normalizeVideoComment(record, 0) : null;
}
