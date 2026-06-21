import { Bookmark, ChevronRight, Heart, MessageSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  getLatestEducationArticles,
  getLatestEducationVideos,
  toggleEducationArticleFavorite,
  toggleEducationArticleLike,
  toggleEducationVideoFavorite,
  toggleEducationVideoLike,
  type EducationArticle,
  type EducationVideo,
} from "../../api/educationMaterials";
import {
  applyLocalMaterialReaction,
  toggleLocalMaterialFavorite,
  toggleLocalMaterialLike,
} from "../../api/localMaterialReactions";
import {
  articleToFavoriteContentItem,
  syncFavoriteContentItem,
  videoToFavoriteContentItem,
} from "../../api/userFavorites";
import { VideoPreview } from "../ui/VideoPreview";

const pageMaxWidth =
  "mx-auto w-full max-w-[390px] px-3 min-[744px]:max-w-[744px] min-[744px]:px-8 min-[1023px]:max-w-[1024px] min-[1023px]:px-16 min-[1420px]:max-w-[1440px] min-[1420px]:px-20 min-[1900px]:max-w-[1980px] min-[1900px]:px-20";

const yellowButton =
  "rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] font-montserrat font-medium text-[#1C100E] shadow-btn";

const copy = {
  ua: {
    articles: "Статті",
    videos: "Відео матеріали",
    allArticles: "Усі Статті",
    allVideos: "Усі відео",
    loading: "Завантажуємо освітні матеріали...",
    emptyArticles: "Статті з'являться тут.",
    emptyVideos: "Відео матеріали з'являться тут.",
    videoFallback: "Назва відео",
  },
  en: {
    articles: "Articles",
    videos: "Video materials",
    allArticles: "All articles",
    allVideos: "All videos",
    loading: "Loading educational materials...",
    emptyArticles: "Articles will appear here.",
    emptyVideos: "Video materials will appear here.",
    videoFallback: "Video title",
  },
};

type DisplayArticle = EducationArticle & { placeholder?: boolean };
type DisplayVideo = EducationVideo & { placeholder?: boolean };

const fallbackArticles: Record<"ua" | "en", DisplayArticle[]> = {
  ua: [
    {
      id: "fallback-article-1",
      slug: "svitlo-u-temriavi",
      title: "«Світло у темряві»",
      description: "Як троє жінок створили простір, що лікує душі",
      content: "",
      sections: [],
      coverImage: "",
      publishedAt: "2025-09-18",
      likesCount: 0,
      commentsCount: 0,
      favoritesCount: 0,
      isLiked: false,
      isFavorite: false,
      placeholder: true,
    },
    {
      id: "fallback-article-2",
      slug: "travmapedahohika",
      title: "Травмапедагогіка",
      description: "Коли гра і підтримка стають рівними повітрям",
      content: "",
      sections: [],
      coverImage: "",
      publishedAt: "2025-09-18",
      likesCount: 0,
      commentsCount: 0,
      favoritesCount: 0,
      isLiked: false,
      isFavorite: false,
      placeholder: true,
    },
  ],
  en: [
    {
      id: "fallback-article-1",
      slug: "light-in-the-dark",
      title: "Light in the dark",
      description: "How support spaces help people recover and breathe again",
      content: "",
      sections: [],
      coverImage: "",
      publishedAt: "2025-09-18",
      likesCount: 0,
      commentsCount: 0,
      favoritesCount: 0,
      isLiked: false,
      isFavorite: false,
      placeholder: true,
    },
    {
      id: "fallback-article-2",
      slug: "trauma-pedagogy",
      title: "Trauma pedagogy",
      description: "When play and support become as necessary as air",
      content: "",
      sections: [],
      coverImage: "",
      publishedAt: "2025-09-18",
      likesCount: 0,
      commentsCount: 0,
      favoritesCount: 0,
      isLiked: false,
      isFavorite: false,
      placeholder: true,
    },
  ],
};

const createFallbackVideos = (language: "ua" | "en"): DisplayVideo[] =>
  Array.from({ length: 3 }, (_, index) => ({
    id: `fallback-video-${index + 1}`,
    slug: "videos",
    title: copy[language].videoFallback,
    description: "",
    videoUrl: "",
    coverImage: "",
    publishedAt: "",
    likesCount: 0,
    commentsCount: 0,
    favoritesCount: 0,
    isLiked: false,
    isFavorite: false,
    placeholder: true,
  }));

const isEnglishLanguage = (language: string) => language.toLowerCase().startsWith("en");

const formatDate = (value: string, language: "ua" | "en") => {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const formatted = parsed.toLocaleDateString(language === "ua" ? "uk-UA" : "en-GB");
  return language === "ua" ? `${formatted}р` : formatted;
};

function MaterialStats({
  likes,
  comments,
  favorites,
  isLiked,
  isFavorite,
  disabled = false,
  onLike,
  onFavorite,
}: {
  likes: number;
  comments: number;
  favorites: number;
  isLiked: boolean;
  isFavorite: boolean;
  disabled?: boolean;
  onLike: () => void;
  onFavorite: () => void;
}) {
  return (
    <div className="flex items-center gap-2 font-montserrat text-[11px] leading-none text-[#1C100E] min-[744px]:gap-3 min-[1023px]:text-[12px]">
      <span>{likes}</span>
      <button
        type="button"
        onClick={onLike}
        disabled={disabled}
        aria-label="like material"
        className="disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Heart
          className={`size-3.5 stroke-[1.8] ${isLiked ? "fill-[#9A176B] stroke-[#9A176B]" : ""}`}
          aria-hidden="true"
        />
      </button>
      <span>{comments}</span>
      <MessageSquare className="size-3.5 stroke-[1.8]" aria-hidden="true" />
      <button
        type="button"
        onClick={onFavorite}
        disabled={disabled}
        aria-label="save material"
        className="disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Bookmark
          className={`size-3.5 stroke-[1.8] ${isFavorite ? "fill-[#9A176B] stroke-[#9A176B]" : ""}`}
          aria-hidden="true"
        />
      </button>
      <span className="sr-only">{favorites}</span>
    </div>
  );
}

function ArticleCard({
  article,
  language,
}: {
  article: DisplayArticle;
  language: "ua" | "en";
}) {
  const [currentArticle, setCurrentArticle] = useState(article);
  const href = currentArticle.placeholder
    ? "/materials/articles"
    : `/materials/articles/${currentArticle.slug}`;

  useEffect(() => {
    setCurrentArticle(article);
  }, [article]);

  const syncArticle = (item: DisplayArticle) => {
    syncFavoriteContentItem(
      articleToFavoriteContentItem(item),
      item.isFavorite,
    );
  };

  const handleLike = async () => {
    if (currentArticle.placeholder || currentArticle.id.startsWith("fallback")) {
      const result = toggleLocalMaterialLike(
        "article",
        currentArticle.slug,
        currentArticle.isLiked,
        currentArticle.likesCount,
      );
      setCurrentArticle({
        ...currentArticle,
        isLiked: result.isLiked,
        likesCount: result.likesCount,
      });
      return;
    }

    const nextLiked = !currentArticle.isLiked;
    const nextLikesCount = Math.max(
      0,
      currentArticle.likesCount + (nextLiked ? 1 : -1),
    );
    const optimisticArticle = {
      ...currentArticle,
      isLiked: nextLiked,
      likesCount: nextLikesCount,
    };

    setCurrentArticle(optimisticArticle);

    try {
      const result = await toggleEducationArticleLike(
        currentArticle.slug,
        nextLiked,
        nextLikesCount,
        language,
      );
      const updatedArticle = {
        ...currentArticle,
        isLiked: result.isLiked,
        likesCount: result.likesCount,
      };

      setCurrentArticle(updatedArticle);
      syncArticle(updatedArticle);
    } catch {
      setCurrentArticle(currentArticle);
      syncArticle(currentArticle);
    }
  };

  const handleFavorite = async () => {
    if (currentArticle.placeholder || currentArticle.id.startsWith("fallback")) {
      const result = toggleLocalMaterialFavorite(
        "article",
        currentArticle.slug,
        currentArticle.isFavorite,
        currentArticle.favoritesCount,
      );
      const updatedArticle = {
        ...currentArticle,
        isFavorite: result.isFavorite,
        favoritesCount: result.favoritesCount,
      };

      setCurrentArticle(updatedArticle);
      syncArticle(updatedArticle);
      return;
    }

    const nextFavorite = !currentArticle.isFavorite;
    const nextFavoritesCount = Math.max(
      0,
      currentArticle.favoritesCount + (nextFavorite ? 1 : -1),
    );
    const optimisticArticle = {
      ...currentArticle,
      isFavorite: nextFavorite,
      favoritesCount: nextFavoritesCount,
    };

    setCurrentArticle(optimisticArticle);

    try {
      const result = await toggleEducationArticleFavorite(
        currentArticle.slug,
        nextFavorite,
        nextFavoritesCount,
        language,
      );
      const updatedArticle = {
        ...currentArticle,
        isFavorite: result.isFavorite,
        favoritesCount: result.favoritesCount,
      };

      setCurrentArticle(updatedArticle);
      syncArticle(updatedArticle);
    } catch {
      setCurrentArticle(currentArticle);
      syncArticle(currentArticle);
    }
  };

  return (
    <article className="rounded-[16px] bg-[#F8F8F8] px-4 py-3 font-montserrat text-[#1C100E] transition hover:-translate-y-0.5 hover:shadow-sm min-[744px]:px-5 min-[1023px]:min-h-[132px] min-[1420px]:min-h-[92px] min-[1900px]:min-h-[102px]">
      <Link
        to={href}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F]"
      >
        <h3 className="line-clamp-1 text-[13px] font-medium leading-[1.18] min-[744px]:text-[14px] min-[1900px]:text-[16px]">
          {currentArticle.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-[11px] leading-[1.22] text-[#1C100E]/78 min-[744px]:text-[12px] min-[1900px]:text-[13px]">
          {currentArticle.description}
        </p>
      </Link>
      <div className="mt-2 flex items-center justify-between gap-3">
        <time className="font-montserrat text-[10px] text-[#1C100E]/75 min-[1023px]:text-[11px]">
          {formatDate(currentArticle.publishedAt, language)}
        </time>
        <MaterialStats
          likes={currentArticle.likesCount}
          comments={currentArticle.commentsCount}
          favorites={currentArticle.favoritesCount}
          isLiked={currentArticle.isLiked}
          isFavorite={currentArticle.isFavorite}
          onLike={handleLike}
          onFavorite={handleFavorite}
        />
      </div>
    </article>
  );
}

function VideoCard({
  video,
  labels,
  language,
}: {
  video: DisplayVideo;
  labels: typeof copy.ua;
  language: "ua" | "en";
}) {
  const [currentVideo, setCurrentVideo] = useState(video);

  useEffect(() => {
    setCurrentVideo(video);
  }, [video]);

  const syncVideo = (item: DisplayVideo) => {
    syncFavoriteContentItem(
      videoToFavoriteContentItem(item),
      item.isFavorite,
    );
  };

  const handleLike = async () => {
    if (currentVideo.placeholder || currentVideo.id.startsWith("fallback")) {
      const result = toggleLocalMaterialLike(
        "video",
        currentVideo.slug,
        currentVideo.isLiked,
        currentVideo.likesCount,
      );
      setCurrentVideo({
        ...currentVideo,
        isLiked: result.isLiked,
        likesCount: result.likesCount,
      });
      return;
    }

    const nextLiked = !currentVideo.isLiked;
    const nextLikesCount = Math.max(0, currentVideo.likesCount + (nextLiked ? 1 : -1));
    const optimisticVideo = {
      ...currentVideo,
      isLiked: nextLiked,
      likesCount: nextLikesCount,
    };

    setCurrentVideo(optimisticVideo);

    try {
      const result = await toggleEducationVideoLike(
        currentVideo.slug,
        nextLiked,
        nextLikesCount,
        language,
      );
      const updatedVideo = {
        ...currentVideo,
        isLiked: result.isLiked,
        likesCount: result.likesCount,
      };

      setCurrentVideo(updatedVideo);
    } catch {
      setCurrentVideo(currentVideo);
    }
  };

  const handleFavorite = async () => {
    if (currentVideo.placeholder || currentVideo.id.startsWith("fallback")) {
      const result = toggleLocalMaterialFavorite(
        "video",
        currentVideo.slug,
        currentVideo.isFavorite,
        currentVideo.favoritesCount,
      );
      const updatedVideo = {
        ...currentVideo,
        isFavorite: result.isFavorite,
        favoritesCount: result.favoritesCount,
      };

      setCurrentVideo(updatedVideo);
      syncVideo(updatedVideo);
      return;
    }

    const nextFavorite = !currentVideo.isFavorite;
    const nextFavoritesCount = Math.max(
      0,
      currentVideo.favoritesCount + (nextFavorite ? 1 : -1),
    );
    const optimisticVideo = {
      ...currentVideo,
      isFavorite: nextFavorite,
      favoritesCount: nextFavoritesCount,
    };

    setCurrentVideo(optimisticVideo);

    try {
      const result = await toggleEducationVideoFavorite(
        currentVideo.slug,
        nextFavorite,
        nextFavoritesCount,
        language,
      );
      const updatedVideo = {
        ...currentVideo,
        isFavorite: result.isFavorite,
        favoritesCount: result.favoritesCount,
      };

      setCurrentVideo(updatedVideo);
      syncVideo(updatedVideo);
    } catch {
      setCurrentVideo(currentVideo);
      syncVideo(currentVideo);
    }
  };

  return (
    <article className="rounded-[16px] bg-[#F8F8F8] p-2.5 font-montserrat text-[#1C100E] min-[744px]:p-3 min-[1023px]:rounded-[18px]">
      <VideoPreview
        title={currentVideo.title}
        videoUrl={currentVideo.videoUrl}
        coverImage={currentVideo.coverImage}
        className="h-[116px] w-full rounded-[14px] min-[744px]:h-[238px] min-[1023px]:h-[232px] min-[1420px]:h-[174px] min-[1900px]:h-[206px]"
      />

      <div className="mt-2 grid grid-cols-[1fr_42px] items-end gap-2">
        <div>
          <h3 className="line-clamp-1 text-[12px] font-medium leading-[1.2] min-[744px]:text-[13px] min-[1900px]:text-[15px]">
            {currentVideo.title || labels.videoFallback}
          </h3>
          <MaterialStats
            likes={currentVideo.likesCount}
            comments={currentVideo.commentsCount}
            favorites={currentVideo.favoritesCount}
            isLiked={currentVideo.isLiked}
            isFavorite={currentVideo.isFavorite}
            onLike={handleLike}
            onFavorite={handleFavorite}
          />
        </div>
        <Link
          to={currentVideo.placeholder ? "/materials/videos" : `/materials/videos/${currentVideo.slug}`}
          className="flex size-10 items-center justify-center rounded-full bg-[#402940] text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] min-[744px]:size-11"
          aria-label={currentVideo.title}
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function Edukationmaterial() {
  const { i18n } = useTranslation();
  const language = useMemo<"ua" | "en">(
    () => (isEnglishLanguage(i18n.language) ? "en" : "ua"),
    [i18n.language],
  );
  const labels = language === "ua" ? copy.ua : copy.en;
  const [articles, setArticles] = useState<EducationArticle[]>([]);
  const [videos, setVideos] = useState<EducationVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const visibleArticles: DisplayArticle[] = !isLoading && articles.length === 0
    ? fallbackArticles[language].map((article) =>
        applyLocalMaterialReaction("article", article),
      )
    : articles;
  const visibleVideos: DisplayVideo[] = !isLoading && videos.length === 0
    ? createFallbackVideos(language).map((video) =>
        applyLocalMaterialReaction("video", video),
      )
    : videos;

  useEffect(() => {
    const controller = new AbortController();

    const loadMaterials = async () => {
      setIsLoading(true);

      try {
        const [latestArticles, latestVideos] = await Promise.all([
          getLatestEducationArticles(language, 2, controller.signal),
          getLatestEducationVideos(language, 3, controller.signal),
        ]);

        setArticles(latestArticles);
        setVideos(latestVideos);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadMaterials();

    return () => controller.abort();
  }, [language]);

  return (
    <section className={`${pageMaxWidth} bg-secondary pb-14 font-montserrat text-[#1C100E] min-[744px]:pb-16 min-[1023px]:pt-6 min-[1420px]:pt-20 min-[1900px]:pt-24`}>
      <div className="mx-auto w-full min-[1023px]:max-w-[880px] min-[1420px]:max-w-[1260px] min-[1900px]:max-w-[1180px]">
        <h1 className="text-center text-[20px] font-medium leading-[1.2] min-[744px]:text-[22px] min-[1023px]:text-[30px] min-[1900px]:text-[34px]">
          {labels.articles}
        </h1>

        {isLoading ? (
          <p className="mt-6 text-center text-[13px] text-[#1C100E]/65">
            {labels.loading}
          </p>
        ) : null}

        <div className="mt-5 grid gap-4 min-[744px]:mt-7 min-[1023px]:grid-cols-2 min-[1023px]:gap-6 min-[1420px]:mt-8 min-[1900px]:gap-10">
          {visibleArticles.map((article) => (
            <ArticleCard key={article.id} article={article} language={language} />
          ))}
        </div>

        <div className="mt-4 flex justify-end min-[744px]:mt-5 min-[1023px]:mt-6">
          <Link
            to="/materials/articles"
            className={`${yellowButton} flex h-10 w-full items-center justify-center text-[13px] min-[744px]:max-w-[280px] min-[1023px]:h-12 min-[1023px]:max-w-[278px] min-[1420px]:max-w-[310px] min-[1900px]:max-w-[345px] min-[1900px]:text-[15px]`}
          >
            {labels.allArticles}
          </Link>
        </div>

        <h2 className="mt-8 text-center text-[22px] font-medium leading-[1.2] min-[744px]:mt-10 min-[1023px]:text-[30px] min-[1900px]:text-[34px]">
          {labels.videos}
        </h2>

        <div className="mt-4 grid gap-4 min-[744px]:mt-5 min-[1023px]:grid-cols-3 min-[1023px]:gap-6 min-[1420px]:mt-6 min-[1900px]:gap-10">
          {visibleVideos.map((video) => (
            <VideoCard key={video.id} video={video} labels={labels} language={language} />
          ))}
        </div>

        <div className="mt-4 flex justify-end min-[744px]:mt-5 min-[1023px]:mt-6">
          <Link
            to="/materials/videos"
            className={`${yellowButton} flex h-10 w-full items-center justify-center text-[13px] min-[744px]:max-w-[280px] min-[1023px]:h-12 min-[1023px]:max-w-[278px] min-[1420px]:max-w-[310px] min-[1900px]:max-w-[345px] min-[1900px]:text-[15px]`}
          >
            {labels.allVideos}
          </Link>
        </div>
      </div>
    </section>
  );
}
