import { Bookmark, ChevronRight, Heart, MessageSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  getEducationVideos,
  toggleEducationVideoFavorite,
  toggleEducationVideoLike,
  type EducationVideo,
} from "../../api/educationMaterials";
import {
  syncFavoriteContentItem,
  videoToFavoriteContentItem,
} from "../../api/userFavorites";
import { createFallbackVideos } from "../../api/videoFallbacks";
import { useCanCreateEvents } from "../../hooks/useCanCreateEvents";

const pageMaxWidth =
  "mx-auto w-full max-w-[390px] px-3 min-[744px]:max-w-[744px] min-[744px]:px-8 min-[1023px]:max-w-[1024px] min-[1023px]:px-16 min-[1420px]:max-w-[1440px] min-[1420px]:px-20 min-[1900px]:max-w-[1980px] min-[1900px]:px-20";

const isEnglishLanguage = (language: string) => language.toLowerCase().startsWith("en");

const copy = {
  ua: {
    title: "Відео матеріали",
    loading: "Завантажуємо відео...",
    addVideo: "Додати Відео",
  },
  en: {
    title: "Video materials",
    loading: "Loading videos...",
    addVideo: "Add video",
  },
} as const;

const yellowButton =
  "rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] font-montserrat font-medium text-[#1C100E] shadow-btn transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F]";

const formatVideoHref = (video: EducationVideo) => `/materials/videos/${video.slug}`;

function VideoStats({
  video,
  onLike,
  onFavorite,
}: {
  video: EducationVideo;
  onLike: () => void;
  onFavorite: () => void;
}) {
  return (
    <div className="flex items-center gap-2 font-montserrat text-[11px] leading-none text-[#1C100E] min-[1023px]:text-[12px]">
      <span>{video.likesCount}</span>
      <button type="button" onClick={onLike} aria-label="like video">
        <Heart
          className={`size-3.5 stroke-[1.8] ${video.isLiked ? "fill-[#9A176B] stroke-[#9A176B]" : ""}`}
          aria-hidden="true"
        />
      </button>
      <span>{video.commentsCount}</span>
      <MessageSquare className="size-3.5 stroke-[1.8]" aria-hidden="true" />
      <button type="button" onClick={onFavorite} aria-label="save video">
        <Bookmark
          className={`size-3.5 stroke-[1.8] ${video.isFavorite ? "fill-[#9A176B] stroke-[#9A176B]" : ""}`}
          aria-hidden="true"
        />
      </button>
      <span className="sr-only">{video.favoritesCount}</span>
    </div>
  );
}

function VideoCard({ video }: { video: EducationVideo }) {
  const [currentVideo, setCurrentVideo] = useState(video);

  useEffect(() => {
    setCurrentVideo(video);
  }, [video]);

  const syncVideo = (item: EducationVideo) => {
    syncFavoriteContentItem(
      videoToFavoriteContentItem(item),
      item.isLiked || item.isFavorite,
    );
  };

  const handleLike = async () => {
    const nextLiked = !currentVideo.isLiked;
    const nextLikesCount = Math.max(0, currentVideo.likesCount + (nextLiked ? 1 : -1));
    const optimisticVideo = {
      ...currentVideo,
      isLiked: nextLiked,
      likesCount: nextLikesCount,
    };

    setCurrentVideo(optimisticVideo);

    if (currentVideo.id.startsWith("fallback")) {
      syncVideo(optimisticVideo);
      return;
    }

    try {
      const result = await toggleEducationVideoLike(
        currentVideo.slug,
        nextLiked,
        nextLikesCount,
      );
      const updatedVideo = {
        ...currentVideo,
        isLiked: result.isLiked,
        likesCount: result.likesCount,
      };

      setCurrentVideo(updatedVideo);
      syncVideo(updatedVideo);
    } catch {
      setCurrentVideo(currentVideo);
      syncVideo(currentVideo);
    }
  };

  const handleFavorite = async () => {
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

    if (currentVideo.id.startsWith("fallback")) {
      syncVideo(optimisticVideo);
      return;
    }

    try {
      const result = await toggleEducationVideoFavorite(
        currentVideo.slug,
        nextFavorite,
        nextFavoritesCount,
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
    <article className="rounded-[18px] bg-[#F8F8F8] p-2.5 font-montserrat text-[#1C100E] min-[744px]:p-3 min-[1023px]:rounded-[18px]">
      <Link
        to={formatVideoHref(currentVideo)}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F]"
      >
        {currentVideo.coverImage ? (
          <img
            src={currentVideo.coverImage}
            alt={currentVideo.title}
            className="h-[153px] w-full rounded-[14px] object-cover min-[744px]:h-[178px] min-[1023px]:h-[206px] min-[1420px]:h-[188px] min-[1900px]:h-[210px]"
          />
        ) : (
          <div className="h-[153px] w-full rounded-[14px] bg-[#D9D9D9] min-[744px]:h-[178px] min-[1023px]:h-[206px] min-[1420px]:h-[188px] min-[1900px]:h-[210px]" />
        )}
      </Link>

      <div className="mt-2 grid grid-cols-[1fr_40px] items-end gap-2">
        <div>
          <Link
            to={formatVideoHref(currentVideo)}
            className="line-clamp-1 text-[13px] font-medium leading-[1.2] hover:text-[#9A176B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] min-[1023px]:text-[14px]"
          >
            {currentVideo.title}
          </Link>
          <VideoStats
            video={currentVideo}
            onLike={handleLike}
            onFavorite={handleFavorite}
          />
        </div>

        <Link
          to={formatVideoHref(currentVideo)}
          className="flex size-10 items-center justify-center rounded-full bg-[#402940] text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] min-[744px]:size-11"
          aria-label={currentVideo.title}
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function VideoMaterialsPage() {
  const { i18n } = useTranslation();
  const canCreateVideos = useCanCreateEvents();
  const language = useMemo<"ua" | "en">(
    () => (isEnglishLanguage(i18n.language) ? "en" : "ua"),
    [i18n.language],
  );
  const labels = copy[language];
  const [videos, setVideos] = useState<EducationVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const loadVideos = async () => {
      setIsLoading(true);

      try {
        const items = await getEducationVideos(language, controller.signal);
        setVideos(items);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadVideos();

    return () => controller.abort();
  }, [language]);

  const visibleVideos = !isLoading && videos.length === 0
    ? createFallbackVideos(language)
    : videos;

  return (
    <section className={`${pageMaxWidth} bg-secondary pb-10 pt-7 font-montserrat text-[#1C100E] min-[744px]:pb-12 min-[744px]:pt-10 min-[1023px]:pt-20 min-[1420px]:pt-[140px] min-[1900px]:pt-[160px]`}>
      <div className="mx-auto w-full min-[744px]:max-w-[650px] min-[1023px]:max-w-[900px] min-[1420px]:max-w-[1260px] min-[1900px]:max-w-[1180px]">
        <h1 className="text-center text-[24px] font-medium leading-[1.2] min-[744px]:text-[28px] min-[1023px]:text-[30px] min-[1900px]:text-[34px]">
          {labels.title}
        </h1>

        {isLoading ? (
          <p className="mt-6 text-center text-[13px] text-[#1C100E]/65">
            {labels.loading}
          </p>
        ) : null}

        <div className="mt-5 grid gap-4 min-[744px]:mt-8 min-[744px]:grid-cols-2 min-[744px]:gap-6 min-[1023px]:grid-cols-3 min-[1023px]:gap-7 min-[1420px]:mt-9 min-[1900px]:gap-10">
          {visibleVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>

        {canCreateVideos ? (
          <div className="mt-6 flex justify-center min-[744px]:justify-end min-[1023px]:mt-8 min-[1420px]:mt-9">
            <Link
              to="/materials/videos/new"
              className={`${yellowButton} flex h-10 w-full max-w-[340px] items-center justify-center text-[13px] min-[744px]:max-w-[305px] min-[1023px]:max-w-[440px] min-[1420px]:max-w-[350px] min-[1900px]:h-12 min-[1900px]:max-w-[330px]`}
            >
              {labels.addVideo}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
