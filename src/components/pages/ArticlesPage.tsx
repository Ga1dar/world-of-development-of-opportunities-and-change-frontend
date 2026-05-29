import { Bookmark, Heart, MessageSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  getEducationArticles,
  toggleEducationArticleFavorite,
  toggleEducationArticleLike,
  type EducationArticle,
} from "../../api/educationMaterials";
import {
  articleToFavoriteContentItem,
  syncFavoriteContentItem,
} from "../../api/userFavorites";
import { getFallbackArticles } from "../../api/articleFallbacks";
import { useCanCreateEvents } from "../../hooks/useCanCreateEvents";

const pageMaxWidth =
  "mx-auto w-full max-w-[390px] px-3 min-[744px]:max-w-[744px] min-[744px]:px-8 min-[1023px]:max-w-[1024px] min-[1023px]:px-16 min-[1420px]:max-w-[1440px] min-[1420px]:px-20 min-[1900px]:max-w-[1980px] min-[1900px]:px-20";

const yellowButton =
  "rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] font-montserrat font-medium text-[#1C100E] shadow-btn transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F]";

const isEnglishLanguage = (language: string) => language.toLowerCase().startsWith("en");

const copy = {
  ua: {
    title: "Статті",
    fallbackUser: "Користувач",
  },
  en: {
    title: "Articles",
    fallbackUser: "User",
  },
};

const formatDate = (value: string, language: "ua" | "en") => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const formatted = parsed.toLocaleDateString(language === "ua" ? "uk-UA" : "en-GB");
  return language === "ua" ? `${formatted}р` : formatted;
};

function ArticleListCard({
  article,
  language,
}: {
  article: EducationArticle;
  language: "ua" | "en";
}) {
  const [likesCount, setLikesCount] = useState(article.likesCount);
  const [isLiked, setIsLiked] = useState(article.isLiked);
  const [isFavorite, setIsFavorite] = useState(article.isFavorite);
  const [favoritesCount, setFavoritesCount] = useState(article.favoritesCount);

  const handleLike = async () => {
    const nextLiked = !isLiked;
    const nextLikesCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
    setIsLiked(nextLiked);
    setLikesCount(nextLikesCount);

    if (article.id.startsWith("fallback")) return;

    try {
      const result = await toggleEducationArticleLike(
        article.slug,
        nextLiked,
        nextLikesCount,
      );
      setIsLiked(result.isLiked);
      setLikesCount(result.likesCount);
      syncFavoriteContentItem(
        articleToFavoriteContentItem({
          ...article,
          isLiked: result.isLiked,
          isFavorite,
          likesCount: result.likesCount,
          favoritesCount,
        }),
        result.isLiked || isFavorite,
      );
    } catch {
      setIsLiked(article.isLiked);
      setLikesCount(article.likesCount);
    }
  };

  const handleFavorite = async () => {
    const nextFavorite = !isFavorite;
    const nextFavoritesCount = Math.max(0, favoritesCount + (nextFavorite ? 1 : -1));
    setIsFavorite(nextFavorite);
    setFavoritesCount(nextFavoritesCount);

    if (article.id.startsWith("fallback")) return;

    try {
      const result = await toggleEducationArticleFavorite(
        article.slug,
        nextFavorite,
        nextFavoritesCount,
      );
      setIsFavorite(result.isFavorite);
      setFavoritesCount(result.favoritesCount);
      syncFavoriteContentItem(
        articleToFavoriteContentItem({
          ...article,
          isLiked,
          isFavorite: result.isFavorite,
          likesCount,
          favoritesCount: result.favoritesCount,
        }),
        isLiked || result.isFavorite,
      );
    } catch {
      setIsFavorite(article.isFavorite);
      setFavoritesCount(article.favoritesCount);
    }
  };

  return (
    <article className="rounded-[18px] bg-[#F8F8F8] px-4 py-4 font-montserrat text-[#1C100E] min-[744px]:rounded-[14px] min-[744px]:px-5 min-[744px]:py-4 min-[1023px]:min-h-[132px] min-[1420px]:min-h-[98px]">
      <Link to={`/materials/articles/${article.slug}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F]">
        <h2 className="line-clamp-2 text-[18px] font-medium leading-[1.2] min-[744px]:text-[20px] min-[1023px]:text-[19px] min-[1900px]:text-[20px]">
          {article.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-[14px] leading-[1.25] text-[#1C100E]/75 min-[744px]:text-[16px] min-[1023px]:text-[15px]">
          {article.description}
        </p>
      </Link>

      <div className="mt-3 flex items-center justify-between gap-4">
        <time className="text-[13px] text-[#1C100E]/70 min-[744px]:text-[14px]">
          {formatDate(article.publishedAt, language)}
        </time>
        <div className="flex items-center gap-3 text-[13px] min-[744px]:gap-4">
          <span>{likesCount}</span>
          <button type="button" onClick={handleLike} aria-label="like article">
            <Heart
              className={`size-5 stroke-[1.8] ${isLiked ? "fill-[#9A176B] stroke-[#9A176B]" : ""}`}
            />
          </button>
          <span>{article.commentsCount}</span>
          <MessageSquare className="size-5 stroke-[1.8]" aria-hidden="true" />
          <button type="button" onClick={handleFavorite} aria-label="save article">
            <Bookmark
              className={`size-5 stroke-[1.8] ${isFavorite ? "fill-[#9A176B] stroke-[#9A176B]" : ""}`}
            />
          </button>
          <span className="sr-only">{favoritesCount}</span>
        </div>
      </div>
    </article>
  );
}

export function ArticlesPage() {
  const { i18n } = useTranslation();
  const language = useMemo<"ua" | "en">(
    () => (isEnglishLanguage(i18n.language) ? "en" : "ua"),
    [i18n.language],
  );
  const labels = copy[language];
  const canCreateArticles = useCanCreateEvents();
  const [articles, setArticles] = useState<EducationArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const loadArticles = async () => {
      setIsLoading(true);

      try {
        const items = await getEducationArticles(language, controller.signal);
        setArticles(items);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadArticles();

    return () => controller.abort();
  }, [language]);

  const visibleArticles = !isLoading && articles.length === 0
    ? getFallbackArticles(language)
    : articles;

  return (
    <section className={`${pageMaxWidth} bg-secondary pb-10 pt-7 font-montserrat text-[#1C100E] min-[744px]:pb-12 min-[744px]:pt-10 min-[1023px]:pt-20 min-[1420px]:pt-[150px] min-[1900px]:pt-[170px]`}>
      <div className="mx-auto w-full min-[1023px]:max-w-[900px] min-[1420px]:max-w-[1240px] min-[1900px]:max-w-[1280px]">
        <h1 className="text-center text-[24px] font-medium leading-[1.2] min-[744px]:text-[32px] min-[1900px]:text-[36px]">
          {labels.title}
        </h1>

        <div className="mt-8 grid gap-5 min-[744px]:mt-10 min-[1023px]:grid-cols-2 min-[1023px]:gap-8 min-[1420px]:gap-10">
          {visibleArticles.map((article) => (
            <ArticleListCard key={article.id} article={article} language={language} />
          ))}
        </div>

        {canCreateArticles ? (
          <div className="mt-6 flex justify-center min-[744px]:mt-8 min-[744px]:justify-end min-[1023px]:mt-10 min-[1420px]:mt-11">
            <Link
              to="/materials/articles/new"
              className={`${yellowButton} flex h-10 w-full max-w-[278px] items-center justify-center text-[13px] min-[744px]:max-w-[280px] min-[1023px]:h-12 min-[1023px]:max-w-[278px] min-[1420px]:max-w-[310px] min-[1900px]:max-w-[345px] min-[1900px]:text-[15px]`}
            >
              {language === "ua" ? "Додати Статтю" : "Add article"}
            </Link>
          </div>
        ) : null}

        <img
          src="/sun.png"
          alt=""
          className="mx-auto mt-8 h-[115px] w-[115px] opacity-70 min-[744px]:mt-11 min-[744px]:h-[210px] min-[744px]:w-[210px] min-[1023px]:h-[220px] min-[1023px]:w-[220px] min-[1420px]:mt-14 min-[1900px]:h-[245px] min-[1900px]:w-[245px]"
        />
      </div>
    </section>
  );
}
