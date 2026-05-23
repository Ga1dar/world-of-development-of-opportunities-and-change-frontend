import { Bookmark, CircleUserRound, Heart, MessageSquare } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { getAccessToken } from "../../api/auth";
import {
  createEducationVideoComment,
  getEducationVideo,
  getEducationVideoComments,
  toggleEducationVideoFavorite,
  toggleEducationVideoLike,
  type EducationArticleComment,
  type EducationVideo,
} from "../../api/educationMaterials";
import {
  syncFavoriteContentItem,
  videoToFavoriteContentItem,
} from "../../api/userFavorites";
import { getFallbackVideo } from "../../api/videoFallbacks";

const pageMaxWidth =
  "mx-auto w-full max-w-[390px] px-3 min-[744px]:max-w-[744px] min-[744px]:px-8 min-[1023px]:max-w-[1024px] min-[1420px]:max-w-[1440px] min-[1420px]:px-20 min-[1900px]:max-w-[1980px] min-[1900px]:px-20";

const isEnglishLanguage = (language: string) => language.toLowerCase().startsWith("en");

const copy = {
  ua: {
    comments: "Залишити коментар",
    placeholder: "Текст...",
    authHint: "Щоб написати коментар, потрібно зареєструватись",
    submit: "Написати",
    fallbackUser: "Користувач",
  },
  en: {
    comments: "Leave a comment",
    placeholder: "Text...",
    authHint: "You need to register to write a comment",
    submit: "Send",
    fallbackUser: "User",
  },
} as const;

type VideoDetailCopy = (typeof copy)[keyof typeof copy];

function VideoActions({
  video,
  onLike,
  onFavorite,
}: {
  video: EducationVideo;
  onLike: () => void;
  onFavorite: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-3 text-[13px] min-[744px]:gap-4 min-[1023px]:text-[14px]">
      <span>{video.likesCount}</span>
      <button type="button" onClick={onLike} aria-label="like video">
        <Heart
          className={`size-5 stroke-[1.8] ${video.isLiked ? "fill-[#9A176B] stroke-[#9A176B]" : ""}`}
        />
      </button>
      <span>{video.commentsCount}</span>
      <MessageSquare className="size-5 stroke-[1.8]" aria-hidden="true" />
      <button type="button" onClick={onFavorite} aria-label="save video">
        <Bookmark
          className={`size-5 stroke-[1.8] ${video.isFavorite ? "fill-[#9A176B] stroke-[#9A176B]" : ""}`}
        />
      </button>
    </div>
  );
}

function VideoFrame({ video }: { video: EducationVideo }) {
  if (video.videoUrl) {
    return (
      <video
        controls
        poster={video.coverImage || undefined}
        className="h-[244px] w-full rounded-[20px] bg-[#D9D9D9] object-cover min-[744px]:h-[462px] min-[1023px]:h-[412px] min-[1420px]:h-[365px] min-[1900px]:h-[450px]"
      >
        <source src={video.videoUrl} />
      </video>
    );
  }

  if (video.coverImage) {
    return (
      <img
        src={video.coverImage}
        alt={video.title}
        className="h-[244px] w-full rounded-[20px] bg-[#D9D9D9] object-cover min-[744px]:h-[462px] min-[1023px]:h-[412px] min-[1420px]:h-[365px] min-[1900px]:h-[450px]"
      />
    );
  }

  return (
    <div className="h-[244px] w-full rounded-[20px] bg-[#D9D9D9] min-[744px]:h-[462px] min-[1023px]:h-[412px] min-[1420px]:h-[365px] min-[1900px]:h-[450px]" />
  );
}

function VideoCommentForm({
  comments,
  labels,
  value,
  isAuthenticated,
  onChange,
  onSubmit,
}: {
  comments: EducationArticleComment[];
  labels: VideoDetailCopy;
  value: string;
  isAuthenticated: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="mt-5 min-[744px]:mt-7 min-[1023px]:mt-8">
      <h2 className="text-[18px] font-medium leading-[1.2] min-[744px]:text-[22px]">
        {labels.comments}
      </h2>

      {comments.length > 0 ? (
        <div className="mt-5 space-y-4">
          {comments.map((comment) => (
            <article key={comment.id} className="rounded-[16px] bg-[#F8F8F8] px-4 py-3">
              <div className="flex items-center gap-3">
                <CircleUserRound className="size-6 stroke-[2]" aria-hidden="true" />
                <p className="text-[14px] font-medium">{comment.author}</p>
              </div>
              <p className="mt-2 text-[14px] leading-[1.35] text-[#1C100E]/75">{comment.text}</p>
            </article>
          ))}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-4">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={!isAuthenticated}
          placeholder={labels.placeholder}
          className="h-9 w-full rounded-[30px] border border-[#40213F] bg-transparent px-4 text-[12px] outline-none placeholder:text-[#1C100E]/50 disabled:opacity-70 min-[744px]:h-10 min-[744px]:text-[14px]"
        />
        <p className="mt-2 text-[11px] text-[#1C100E]/65 min-[744px]:text-[12px]">
          {labels.authHint}
        </p>
        <button
          type="submit"
          disabled={!isAuthenticated || value.trim().length === 0}
          className="mt-4 flex h-11 w-full items-center justify-center rounded-[30px] bg-white text-[14px] font-medium disabled:opacity-60 min-[744px]:ml-auto min-[744px]:h-12 min-[744px]:max-w-[160px]"
        >
          {labels.submit}
        </button>
      </form>
    </section>
  );
}

export function VideoDetailPage() {
  const { slug = "" } = useParams();
  const { i18n } = useTranslation();
  const language = useMemo<"ua" | "en">(
    () => (isEnglishLanguage(i18n.language) ? "en" : "ua"),
    [i18n.language],
  );
  const labels = copy[language];
  const [video, setVideo] = useState<EducationVideo>(() => getFallbackVideo(language, slug));
  const [comments, setComments] = useState<EducationArticleComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAccessToken()));

  useEffect(() => {
    const controller = new AbortController();

    const loadVideo = async () => {
      const item = await getEducationVideo(slug, language, controller.signal);
      if (!controller.signal.aborted) {
        setVideo(item ?? getFallbackVideo(language, slug));
      }
    };

    void loadVideo();

    return () => controller.abort();
  }, [language, slug]);

  useEffect(() => {
    const controller = new AbortController();

    const loadComments = async () => {
      const items = await getEducationVideoComments(video.slug, controller.signal);
      if (!controller.signal.aborted) {
        setComments(items);
      }
    };

    if (!video.id.startsWith("fallback")) {
      void loadComments();
    } else {
      setComments([]);
    }

    return () => controller.abort();
  }, [video.id, video.slug]);

  useEffect(() => {
    const updateAuth = () => setIsAuthenticated(Boolean(getAccessToken()));
    window.addEventListener("auth-changed", updateAuth);
    window.addEventListener("storage", updateAuth);

    return () => {
      window.removeEventListener("auth-changed", updateAuth);
      window.removeEventListener("storage", updateAuth);
    };
  }, []);

  const handleLike = async () => {
    const nextLiked = !video.isLiked;
    const nextLikesCount = Math.max(0, video.likesCount + (nextLiked ? 1 : -1));
    const optimisticVideo = {
      ...video,
      isLiked: nextLiked,
      likesCount: nextLikesCount,
    };

    setVideo(optimisticVideo);

    if (video.id.startsWith("fallback")) {
      syncFavoriteContentItem(
        videoToFavoriteContentItem(optimisticVideo),
        optimisticVideo.isLiked || optimisticVideo.isFavorite,
      );
      return;
    }

    try {
      const result = await toggleEducationVideoLike(video.slug, nextLiked, nextLikesCount);
      const updatedVideo = {
        ...video,
        isLiked: result.isLiked,
        likesCount: result.likesCount,
      };

      setVideo(updatedVideo);
      syncFavoriteContentItem(
        videoToFavoriteContentItem(updatedVideo),
        updatedVideo.isLiked || updatedVideo.isFavorite,
      );
    } catch {
      setVideo(video);
      syncFavoriteContentItem(
        videoToFavoriteContentItem(video),
        video.isLiked || video.isFavorite,
      );
    }
  };

  const handleFavorite = async () => {
    const nextFavorite = !video.isFavorite;
    const nextFavoritesCount = Math.max(0, video.favoritesCount + (nextFavorite ? 1 : -1));
    const optimisticVideo = {
      ...video,
      isFavorite: nextFavorite,
      favoritesCount: nextFavoritesCount,
    };

    setVideo(optimisticVideo);

    if (video.id.startsWith("fallback")) {
      syncFavoriteContentItem(
        videoToFavoriteContentItem(optimisticVideo),
        optimisticVideo.isLiked || optimisticVideo.isFavorite,
      );
      return;
    }

    try {
      const result = await toggleEducationVideoFavorite(
        video.slug,
        nextFavorite,
        nextFavoritesCount,
      );
      const updatedVideo = {
        ...video,
        isFavorite: result.isFavorite,
        favoritesCount: result.favoritesCount,
      };

      setVideo(updatedVideo);
      syncFavoriteContentItem(
        videoToFavoriteContentItem(updatedVideo),
        updatedVideo.isLiked || updatedVideo.isFavorite,
      );
    } catch {
      setVideo(video);
      syncFavoriteContentItem(
        videoToFavoriteContentItem(video),
        video.isLiked || video.isFavorite,
      );
    }
  };

  const handleCommentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = commentText.trim();
    if (!text || video.id.startsWith("fallback")) return;

    try {
      const created = await createEducationVideoComment(video.slug, text);
      if (created) {
        setComments((current) => [created, ...current]);
        setVideo((current) => ({ ...current, commentsCount: current.commentsCount + 1 }));
        setCommentText("");
      }
    } catch {
      // The visible hint already explains that comments require an account.
    }
  };

  return (
    <article className={`${pageMaxWidth} bg-secondary pb-10 pt-7 font-montserrat text-[#1C100E] min-[744px]:pb-12 min-[744px]:pt-12 min-[1023px]:pt-20 min-[1420px]:pt-[140px] min-[1900px]:pt-[165px]`}>
      <div className="mx-auto w-full min-[744px]:max-w-[650px] min-[1023px]:max-w-[900px] min-[1420px]:max-w-[820px] min-[1900px]:max-w-[1140px]">
        <h1 className="text-center text-[20px] font-medium leading-[1.2] min-[744px]:text-[28px] min-[1023px]:text-[30px] min-[1900px]:text-[36px]">
          {video.title}
        </h1>

        <div className="mt-7 min-[744px]:mt-9 min-[1023px]:mt-10">
          <VideoFrame video={video} />
        </div>

        <div className="mt-3 min-[744px]:mt-4">
          <VideoActions video={video} onLike={handleLike} onFavorite={handleFavorite} />
        </div>

        <VideoCommentForm
          comments={comments}
          labels={labels}
          value={commentText}
          isAuthenticated={isAuthenticated}
          onChange={setCommentText}
          onSubmit={handleCommentSubmit}
        />
      </div>
    </article>
  );
}
