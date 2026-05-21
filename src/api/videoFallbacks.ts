import type { EducationVideo } from "./educationMaterials";

const fallbackTitle = {
  ua: "Назва відео",
  en: "Video title",
} as const;

export const createFallbackVideos = (language: "ua" | "en", count = 6): EducationVideo[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `fallback-video-${index + 1}`,
    slug: `fallback-video-${index + 1}`,
    title: fallbackTitle[language],
    description: "",
    videoUrl: "",
    coverImage: "",
    publishedAt: "",
    likesCount: 0,
    commentsCount: 0,
    favoritesCount: 0,
    isLiked: false,
    isFavorite: false,
  }));

export const getFallbackVideo = (language: "ua" | "en", slug = "fallback-video-1") => ({
  ...createFallbackVideos(language, 1)[0],
  slug,
});
