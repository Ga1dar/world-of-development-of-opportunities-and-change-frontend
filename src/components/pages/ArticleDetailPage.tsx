import { Bookmark, CircleUserRound, Heart, MessageSquare } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { getAccessToken } from "../../api/auth";
import {
  createEducationArticleComment,
  getEducationArticle,
  getEducationArticleComments,
  toggleEducationArticleFavorite,
  toggleEducationArticleLike,
  type EducationArticle,
  type EducationArticleComment,
  type EducationArticleSection,
} from "../../api/educationMaterials";
import {
  applyLocalMaterialReaction,
  toggleLocalMaterialFavorite,
  toggleLocalMaterialLike,
} from "../../api/localMaterialReactions";
import {
  articleToFavoriteContentItem,
  syncFavoriteContentItem,
} from "../../api/userFavorites";
import { getFallbackArticle, getFallbackArticles } from "../../api/articleFallbacks";

const pageMaxWidth =
  "mx-auto w-full max-w-[390px] px-3 min-[744px]:max-w-[744px] min-[744px]:px-8 min-[1023px]:max-w-[1024px] min-[1023px]:px-16 min-[1420px]:max-w-[1440px] min-[1420px]:px-16 min-[1900px]:max-w-[1980px] min-[1900px]:px-16";

const isEnglishLanguage = (language: string) => language.toLowerCase().startsWith("en");

const copy = {
  ua: {
    contents: "Зміст",
    comments: "Коментарі",
    reply: "Напишіть відповідь",
    placeholder: "Текст...",
    authHint: "Щоб написати коментар, потрібно зареєструватись",
    submit: "Написати",
    fallbackUser: "Користувач",
  },
  en: {
    contents: "Contents",
    comments: "Comments",
    reply: "Write a reply",
    placeholder: "Text...",
    authHint: "You need to register to write a comment",
    submit: "Send",
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

function RichText({ content }: { content: string }) {
  if (!content) return null;

  if (/<[a-z][\s\S]*>/i.test(content)) {
    return (
      <div
        className="space-y-3 [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-semibold"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {content.split(/\n{2,}/).map((paragraph) => (
        <p key={paragraph} className="whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function ArticleActions({
  article,
  disabled = false,
  onLike,
  onFavorite,
}: {
  article: EducationArticle;
  disabled?: boolean;
  onLike: () => void;
  onFavorite: () => void;
}) {
  return (
    <div className="flex items-center gap-3 text-[13px] min-[744px]:gap-4 min-[1023px]:text-[14px]">
      <span>{article.likesCount}</span>
      <button
        type="button"
        onClick={onLike}
        disabled={disabled}
        aria-label="like article"
        className="disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Heart
          className={`size-5 stroke-[1.8] ${article.isLiked ? "fill-[#9A176B] stroke-[#9A176B]" : ""}`}
        />
      </button>
      <span>{article.commentsCount}</span>
      <MessageSquare className="size-5 stroke-[1.8]" aria-hidden="true" />
      <button
        type="button"
        onClick={onFavorite}
        disabled={disabled}
        aria-label="save article"
        className="disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Bookmark
          className={`size-5 stroke-[1.8] ${article.isFavorite ? "fill-[#9A176B] stroke-[#9A176B]" : ""}`}
        />
      </button>
    </div>
  );
}

function CommentForm({
  comments,
  labels,
  value,
  isAuthenticated,
  onChange,
  onSubmit,
}: {
  comments: EducationArticleComment[];
  labels: typeof copy.ua;
  value: string;
  isAuthenticated: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="relative z-10 mt-12 border-t border-[#1C100E]/55 pt-8 min-[744px]:mt-14 min-[1023px]:mt-16">
      <img
        src="/sun.png"
        alt=""
        className="pointer-events-none absolute bottom-0 right-1 hidden h-[170px] w-[170px] opacity-60 min-[744px]:block min-[1023px]:h-[210px] min-[1023px]:w-[210px] min-[1420px]:right-24"
      />

      <h2 className="text-[22px] font-medium leading-[1.2] min-[744px]:text-[28px]">
        {labels.comments} ( {comments.length} )
      </h2>

      <div className="mt-5 flex items-center gap-4">
        <CircleUserRound className="size-8 stroke-[2]" aria-hidden="true" />
        <span className="text-[14px] text-[#1C100E]/75 min-[744px]:text-[16px]">
          {labels.reply}
        </span>
      </div>

      {comments.length > 0 ? (
        <div className="mt-5 space-y-4">
          {comments.map((comment) => (
            <article key={comment.id} className="rounded-[16px] bg-[#F8F8F8] px-4 py-3">
              <p className="text-[14px] font-medium">{comment.author}</p>
              <p className="mt-1 text-[14px] leading-[1.35] text-[#1C100E]/75">{comment.text}</p>
            </article>
          ))}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="relative z-1 mt-6 max-w-[840px]">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={!isAuthenticated}
          placeholder={labels.placeholder}
          className="h-11 w-full rounded-[30px] border border-[#40213F] bg-transparent px-4 text-[14px] outline-none placeholder:text-[#1C100E]/50 disabled:opacity-70"
        />
        <p className="mt-3 text-[13px] text-[#1C100E]/65">{labels.authHint}</p>
        <button
          type="submit"
          disabled={!isAuthenticated || value.trim().length === 0}
          className="mt-5 flex h-12 w-full max-w-none items-center justify-center rounded-[30px] bg-white text-[15px] font-medium disabled:opacity-60 min-[744px]:ml-auto min-[744px]:max-w-[260px]"
        >
          {labels.submit}
        </button>
      </form>
    </section>
  );
}

const getRenderableSections = (article: EducationArticle): EducationArticleSection[] => {
  if (article.sections.length > 0) return article.sections;

  if (!article.content) return [];

  return [
    {
      id: "content",
      slug: "content",
      title: "",
      content: article.content,
      order: 1,
    },
  ];
};

export function ArticleDetailPage() {
  const { slug = "" } = useParams();
  const { i18n } = useTranslation();
  const language = useMemo<"ua" | "en">(
    () => (isEnglishLanguage(i18n.language) ? "en" : "ua"),
    [i18n.language],
  );
  const labels = copy[language];
  const [article, setArticle] = useState<EducationArticle>(() =>
    applyLocalMaterialReaction("article", getFallbackArticle(language, slug)),
  );
  const [comments, setComments] = useState<EducationArticleComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAccessToken()));
  const [isContentsOpen, setIsContentsOpen] = useState(false);
  const articleGridRef = useRef<HTMLDivElement>(null);
  const contentsColumnRef = useRef<HTMLElement>(null);
  const contentsCardRef = useRef<HTMLDivElement>(null);
  const mobileContentsCardRef = useRef<HTMLDivElement>(null);
  const contentsStyleRef = useRef("");
  const mobileContentsStyleRef = useRef("");
  const [contentsStyle, setContentsStyle] = useState<CSSProperties>();
  const [mobileContentsStyle, setMobileContentsStyle] = useState<CSSProperties>();

  useEffect(() => {
    const controller = new AbortController();

    const loadArticle = async () => {
      const fallbackArticle = getFallbackArticles(language).find(
        (item) => item.slug === slug,
      );

      if (fallbackArticle) {
        setArticle(applyLocalMaterialReaction("article", fallbackArticle));
        return;
      }

      const item = await getEducationArticle(slug, language, controller.signal);
      if (!controller.signal.aborted) {
        setArticle(
          item ?? applyLocalMaterialReaction("article", getFallbackArticle(language, slug)),
        );
      }
    };

    void loadArticle();

    return () => controller.abort();
  }, [language, slug]);

  useEffect(() => {
    const controller = new AbortController();

    const loadComments = async () => {
      if (article.id.startsWith("fallback")) return [];

      return getEducationArticleComments(article.slug, controller.signal);
    };

    void loadComments().then((items) => {
      if (!controller.signal.aborted) setComments(items);
    });

    return () => controller.abort();
  }, [article.id, article.slug]);

  useEffect(() => {
    const updateAuth = () => setIsAuthenticated(Boolean(getAccessToken()));
    window.addEventListener("auth-changed", updateAuth);
    window.addEventListener("storage", updateAuth);

    return () => {
      window.removeEventListener("auth-changed", updateAuth);
      window.removeEventListener("storage", updateAuth);
    };
  }, []);

  const sections = getRenderableSections(article);
  const intro = article.content || (sections.length === 0 ? article.description : "");
  const titledSections = sections.filter((section) => section.title);

  useEffect(() => {
    let frameId = 0;

    const updateContentsPosition = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const grid = articleGridRef.current;
        const column = contentsColumnRef.current;
        const card = contentsCardRef.current;

        if (!grid || !column || !card || window.innerWidth < 1420) {
          if (contentsStyleRef.current) {
            contentsStyleRef.current = "";
            setContentsStyle(undefined);
          }
          return;
        }

        const topOffset = window.innerWidth >= 1900 ? 333 : 303;
        const footerGap = 24;
        const columnRect = column.getBoundingClientRect();
        const gridRect = grid.getBoundingClientRect();
        const cardHeight = card.offsetHeight;
        const top = Math.min(topOffset, gridRect.bottom - cardHeight - footerGap);

        const nextStyle: CSSProperties = {
          position: "fixed",
          top,
          left: columnRect.left,
          width: columnRect.width,
          zIndex: 20,
        };
        const nextKey = `${Math.round(top)}:${Math.round(columnRect.left)}:${Math.round(columnRect.width)}`;

        if (contentsStyleRef.current !== nextKey) {
          contentsStyleRef.current = nextKey;
          setContentsStyle(nextStyle);
        }
      });
    };

    updateContentsPosition();
    window.addEventListener("scroll", updateContentsPosition, { passive: true });
    window.addEventListener("resize", updateContentsPosition);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", updateContentsPosition);
      window.removeEventListener("resize", updateContentsPosition);
    };
  }, [article.slug, sections.length]);

  useEffect(() => {
    let frameId = 0;

    const updateMobileContentsPosition = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const card = mobileContentsCardRef.current;

        if (!isContentsOpen || !card || window.innerWidth >= 1420) {
          if (mobileContentsStyleRef.current) {
            mobileContentsStyleRef.current = "";
            setMobileContentsStyle(undefined);
          }
          return;
        }

        const topOffset = window.innerWidth >= 1023 ? 170 : window.innerWidth >= 744 ? 150 : 124;
        const footerGap = 24;
        const footer = document.querySelector("footer");
        const footerTop = footer?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
        const cardHeight = card.offsetHeight;
        const top = Math.max(16, Math.min(topOffset, footerTop - cardHeight - footerGap));
        const nextKey = `${Math.round(top)}`;

        if (mobileContentsStyleRef.current !== nextKey) {
          mobileContentsStyleRef.current = nextKey;
          setMobileContentsStyle({ top });
        }
      });
    };

    updateMobileContentsPosition();
    window.addEventListener("scroll", updateMobileContentsPosition, { passive: true });
    window.addEventListener("resize", updateMobileContentsPosition);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", updateMobileContentsPosition);
      window.removeEventListener("resize", updateMobileContentsPosition);
    };
  }, [isContentsOpen, article.slug, sections.length]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsContentsOpen(false), 0);

    return () => window.clearTimeout(timeoutId);
  }, [article.slug]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsContentsOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1420) {
        setIsContentsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLike = async () => {
    if (article.id.startsWith("fallback")) {
      const result = toggleLocalMaterialLike(
        "article",
        article.slug,
        article.isLiked,
        article.likesCount,
      );
      setArticle({
        ...article,
        isLiked: result.isLiked,
        likesCount: result.likesCount,
      });
      return;
    }

    const nextLiked = !article.isLiked;
    const nextLikesCount = Math.max(0, article.likesCount + (nextLiked ? 1 : -1));
    const optimisticArticle = {
      ...article,
      isLiked: nextLiked,
      likesCount: nextLikesCount,
    };

    setArticle(optimisticArticle);

    try {
      const result = await toggleEducationArticleLike(
        article.slug,
        nextLiked,
        nextLikesCount,
        language,
      );
      const updatedArticle = {
        ...article,
        isLiked: result.isLiked,
        likesCount: result.likesCount,
      };

      setArticle(updatedArticle);
      syncFavoriteContentItem(
        articleToFavoriteContentItem(updatedArticle),
        updatedArticle.isFavorite,
      );
    } catch {
      setArticle(article);
      syncFavoriteContentItem(
        articleToFavoriteContentItem(article),
        article.isFavorite,
      );
    }
  };

  const handleFavorite = async () => {
    if (article.id.startsWith("fallback")) {
      const result = toggleLocalMaterialFavorite(
        "article",
        article.slug,
        article.isFavorite,
        article.favoritesCount,
      );
      const updatedArticle = {
        ...article,
        isFavorite: result.isFavorite,
        favoritesCount: result.favoritesCount,
      };

      setArticle(updatedArticle);
      syncFavoriteContentItem(articleToFavoriteContentItem(updatedArticle), result.isFavorite);
      return;
    }

    const nextFavorite = !article.isFavorite;
    const nextFavoritesCount = Math.max(0, article.favoritesCount + (nextFavorite ? 1 : -1));
    const optimisticArticle = {
      ...article,
      isFavorite: nextFavorite,
      favoritesCount: nextFavoritesCount,
    };

    setArticle(optimisticArticle);

    try {
      const result = await toggleEducationArticleFavorite(
        article.slug,
        nextFavorite,
        nextFavoritesCount,
        language,
      );
      const updatedArticle = {
        ...article,
        isFavorite: result.isFavorite,
        favoritesCount: result.favoritesCount,
      };

      setArticle(updatedArticle);
      syncFavoriteContentItem(
        articleToFavoriteContentItem(updatedArticle),
        updatedArticle.isFavorite,
      );
    } catch {
      setArticle(article);
      syncFavoriteContentItem(
        articleToFavoriteContentItem(article),
        article.isFavorite,
      );
    }
  };

  const handleCommentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = commentText.trim();
    if (!text || article.id.startsWith("fallback")) return;

    try {
      const created = await createEducationArticleComment(article.slug, text);
      if (created) {
        setComments((current) => [created, ...current]);
        setArticle((current) => ({ ...current, commentsCount: current.commentsCount + 1 }));
        setCommentText("");
      }
    } catch {
      // The visible hint already explains that comments require an account.
    }
  };

  return (
    <article className={`${pageMaxWidth} bg-secondary pb-10 pt-4 font-montserrat text-[#1C100E] min-[744px]:pt-8 min-[1023px]:pt-16 min-[1420px]:pt-[105px] min-[1900px]:pt-[135px]`}>
      <div ref={articleGridRef} className="mx-auto grid w-full gap-10 min-[1420px]:max-w-none min-[1420px]:grid-cols-[minmax(0,790px)_360px] min-[1420px]:gap-16 min-[1900px]:max-w-none min-[1900px]:grid-cols-[minmax(0,1060px)_430px]">
        <div className="relative">
          <img
            src="/sun.png"
            alt=""
            className="pointer-events-none absolute top-[920px] right-0 z-0 h-[166px] w-[166px] opacity-55 min-[744px]:top-[790px] min-[744px]:right-12 min-[744px]:h-[321px] min-[744px]:w-[321px] min-[1023px]:top-[850px] min-[1023px]:right-20 min-[1023px]:h-[321px] min-[1023px]:w-[321px] min-[1420px]:top-[640px] min-[1420px]:right-[105px] min-[1420px]:h-[260px] min-[1420px]:w-[260px] min-[1900px]:top-[700px] min-[1900px]:right-[170px] min-[1900px]:h-[300px] min-[1900px]:w-[300px]"
          />

          <div className="flex justify-end min-[1420px]:hidden">
            <button
              type="button"
              aria-expanded={isContentsOpen}
              onClick={() => setIsContentsOpen((current) => !current)}
              className="rounded-full bg-[#E9D4E3] px-7 py-3 text-[15px] font-medium"
            >
              {labels.contents}
            </button>
          </div>

          <div
            ref={mobileContentsCardRef}
            style={mobileContentsStyle}
            className={`fixed right-3 top-[124px] z-[140] max-h-[calc(100dvh-148px)] w-[min(calc(100vw-24px),280px)] overflow-y-auto rounded-[20px] border border-[#B45598] bg-[#F8F8F8] px-6 py-6 shadow-[0_14px_36px_rgba(64,33,63,0.18)] transition duration-200 min-[744px]:right-8 min-[744px]:top-[150px] min-[744px]:w-[340px] min-[1023px]:top-[170px] min-[1023px]:w-[360px] min-[1420px]:hidden ${
              isContentsOpen
                ? "pointer-events-auto translate-x-0 opacity-100"
                : "pointer-events-none translate-x-4 opacity-0"
            }`}
          >
            <h2 className="sr-only">{labels.contents}</h2>
            <nav className="space-y-5 text-[14px] font-medium leading-[1.25] min-[744px]:space-y-6 min-[744px]:text-[15px]">
              {titledSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.slug}`}
                  onClick={() => setIsContentsOpen(false)}
                  className="block transition hover:text-[#9A176B]"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>

          <h1 className="mt-2 max-w-[820px] text-[24px] font-medium leading-[1.22] min-[744px]:mt-7 min-[744px]:text-[38px] min-[1023px]:text-[36px] min-[1420px]:mt-0 min-[1900px]:text-[42px]">
            {article.title}
          </h1>

          <div className="mt-5 flex items-center justify-between gap-4">
            <time className="text-[13px] text-[#1C100E]/70 min-[744px]:text-[14px]">
              {formatDate(article.publishedAt, language)}
            </time>
            <ArticleActions
              article={article}
              onLike={handleLike}
              onFavorite={handleFavorite}
            />
          </div>

          <div className="relative z-10 mt-7 space-y-8 text-[16px] leading-[1.42] text-[#2D302D] min-[744px]:text-[18px] min-[1023px]:text-[17px] min-[1900px]:text-[18px]">
            {intro ? <RichText content={intro} /> : null}

            {sections.map((section) => (
              <section key={section.id} id={section.slug} className="scroll-mt-24">
                {section.title && section.slug !== article.slug ? (
                  <h2 className="mb-4 text-[22px] font-medium leading-[1.25] text-[#1C100E] min-[744px]:text-[28px]">
                    {section.title}
                  </h2>
                ) : null}
                <RichText content={section.content} />
              </section>
            ))}
          </div>

          <CommentForm
            comments={comments}
            labels={labels}
            value={commentText}
            isAuthenticated={isAuthenticated}
            onChange={setCommentText}
            onSubmit={handleCommentSubmit}
          />
        </div>

        <aside ref={contentsColumnRef} className="hidden min-[1420px]:block">
          <div ref={contentsCardRef} style={contentsStyle} className="min-h-[330px] rounded-[20px] border border-[#B45598] bg-[#F8F8F8] px-9 py-9 min-[1900px]:min-h-[370px] min-[1900px]:px-11 min-[1900px]:py-10">
            <h2 className="sr-only">{labels.contents}</h2>
            <nav className="space-y-8 text-[15px] font-medium leading-[1.25] min-[1900px]:space-y-9 min-[1900px]:text-[17px]">
              {titledSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.slug}`}
                  className="block transition hover:text-[#9A176B]"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      </div>

      <Link to="/materials/articles" className="sr-only">
        {labels.contents}
      </Link>
    </article>
  );
}
