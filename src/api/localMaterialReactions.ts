type LocalMaterialKind = "article" | "video";

type LocalMaterialReaction = {
  isLiked?: boolean;
  likesCount?: number;
  isFavorite?: boolean;
  favoritesCount?: number;
};

type ReactableMaterial = {
  slug: string;
  isLiked: boolean;
  likesCount: number;
  isFavorite: boolean;
  favoritesCount: number;
};

const STORAGE_KEY = "svityFallbackMaterialReactions";

const readStore = () => {
  if (typeof window === "undefined") return {};

  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return value && typeof value === "object"
      ? (value as Record<string, LocalMaterialReaction>)
      : {};
  } catch {
    return {};
  }
};

const writeStore = (store: Record<string, LocalMaterialReaction>) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

const reactionKey = (kind: LocalMaterialKind, slug: string) => `${kind}:${slug}`;

export const readLocalMaterialReaction = (kind: LocalMaterialKind, slug: string) => {
  if (!slug) return null;
  return readStore()[reactionKey(kind, slug)] ?? null;
};

export const saveLocalMaterialReaction = (
  kind: LocalMaterialKind,
  slug: string,
  state: LocalMaterialReaction,
) => {
  if (!slug) return;

  const store = readStore();
  const key = reactionKey(kind, slug);
  store[key] = { ...store[key], ...state };
  writeStore(store);
};

export const applyLocalMaterialReaction = <T extends ReactableMaterial>(
  kind: LocalMaterialKind,
  item: T,
) => {
  const reaction = readLocalMaterialReaction(kind, item.slug);
  if (!reaction) return item;

  return {
    ...item,
    isLiked: reaction.isLiked ?? item.isLiked,
    likesCount: reaction.likesCount ?? item.likesCount,
    isFavorite: reaction.isFavorite ?? item.isFavorite,
    favoritesCount: reaction.favoritesCount ?? item.favoritesCount,
  };
};

export const toggleLocalMaterialLike = (
  kind: LocalMaterialKind,
  slug: string,
  currentLiked: boolean,
  currentLikesCount: number,
) => {
  const isLiked = !currentLiked;
  const likesCount = Math.max(0, currentLikesCount + (isLiked ? 1 : -1));
  saveLocalMaterialReaction(kind, slug, { isLiked, likesCount });
  return { isLiked, likesCount };
};

export const toggleLocalMaterialFavorite = (
  kind: LocalMaterialKind,
  slug: string,
  currentFavorite: boolean,
  currentFavoritesCount: number,
) => {
  const isFavorite = !currentFavorite;
  const favoritesCount = Math.max(0, currentFavoritesCount + (isFavorite ? 1 : -1));
  saveLocalMaterialReaction(kind, slug, { isFavorite, favoritesCount });
  return { isFavorite, favoritesCount };
};
