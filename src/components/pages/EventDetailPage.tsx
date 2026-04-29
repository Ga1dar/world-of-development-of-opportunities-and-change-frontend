import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Bookmark, Heart, MessageSquare, CircleUserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  createEventComment,
  getEvent,
  getEventComments,
  type EventComment,
  type EventItem,
} from "../../api/events";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const MAX_VISIBLE_GALLERY_IMAGES = 6;

const uniqueImages = (event: EventItem) => {
  const images = [event.image, ...event.galleryImages].filter(Boolean);
  return Array.from(new Set(images)).slice(0, MAX_VISIBLE_GALLERY_IMAGES);
};

export function EventDetailPage() {
  const { eventId = "" } = useParams();
  const { i18n, t } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "ua";
  const [event, setEvent] = useState<EventItem | null>(null);
  const [comments, setComments] = useState<EventComment[]>([]);
  const [author, setAuthor] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    Promise.all([getEvent(eventId), getEventComments(eventId)]).then(
      ([eventItem, commentItems]) => {
        if (!isMounted) return;
        setEvent(eventItem);
        setComments(commentItems);
      },
    );

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  const handleCommentSubmit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    setCommentError("");

    const cleanAuthor = author.trim();
    const cleanText = commentText.trim();
    if (!cleanAuthor || cleanText.length < 2) {
      setCommentError(t("eventComments.validationError"));
      return;
    }

    setIsCommentSubmitting(true);

    try {
      const created = await createEventComment(eventId, {
        author: cleanAuthor,
        text: cleanText,
      });
      setComments((current) => [created, ...current]);
      setAuthor("");
      setCommentText("");
    } catch {
      const localComment: EventComment = {
        id: Date.now(),
        author: cleanAuthor.slice(0, 80),
        text: cleanText.slice(0, 1000),
        createdAt: new Date().toISOString(),
      };
      setComments((current) => [localComment, ...current]);
      setAuthor("");
      setCommentText("");
      setCommentError(t("eventComments.fallbackNotice"));
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const images = useMemo(() => (event ? uniqueImages(event) : []), [event]);

  if (!event) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center bg-secondary font-montserrat text-[#1C100E]">
        {t("eventsLoading")}
      </section>
    );
  }

  const title = lang === "en" ? event.title_en : event.title_ua;
  const description = lang === "en" ? event.description_en : event.description_ua;
  const leadParagraphs = description.slice(0, 4);
  const sideParagraphs = description.slice(4, 9);
  const closingParagraphs = description.slice(9);
  const galleryImages = images.slice(1);
  const topGalleryImages = galleryImages.slice(0, 2);
  const bottomGalleryImages = galleryImages.slice(2, 5);

  return (
    <section className="bg-secondary px-5 pb-12 pt-5 font-montserrat text-[#1C100E] min-[390px]:px-7 min-[744px]:px-10 min-[744px]:pb-14 min-[744px]:pt-8 min-[1023px]:px-12 min-[1023px]:pt-8 min-[1420px]:px-20 min-[1900px]:pb-20">
      <article className="mx-auto w-full max-w-[336px] min-[744px]:max-w-[680px] min-[1023px]:max-w-[880px] min-[1420px]:max-w-[1208px] min-[1900px]:max-w-[1548px]">
        <div className="grid gap-5 min-[744px]:gap-6 min-[1023px]:grid-cols-[340px_1fr] min-[1023px]:gap-x-7 min-[1420px]:grid-cols-[380px_1fr] min-[1420px]:gap-x-8 min-[1900px]:grid-cols-[440px_1fr] min-[1900px]:gap-x-10">
          <div className="contents min-[1023px]:block">
            <h1 className="order-1 text-[18px] font-medium leading-[1.23] min-[744px]:text-[24px] min-[1023px]:hidden">
              {title}
            </h1>

            <div className="order-2 flex items-center gap-3 text-[#1C100E] min-[1023px]:hidden">
              <span className="text-[12px]">0</span>
              <Heart className="size-4" aria-hidden="true" />
              <span className="text-[12px]">0</span>
              <MessageSquare className="size-4" aria-hidden="true" />
              <Bookmark className="size-4" aria-hidden="true" />
            </div>

            <img
              src={event.image}
              alt={title}
              className="order-3 aspect-[1.36] w-full rounded-[8px] object-cover min-[744px]:aspect-[1.78] min-[1023px]:aspect-[1.36]"
            />

            <div className="order-6 text-[12px] leading-[1.42] text-[#1C100E]/82 min-[744px]:text-[13px] min-[1023px]:mt-6 min-[1023px]:text-[13px] min-[1420px]:text-[14px]">
              {(sideParagraphs.length ? sideParagraphs : description.slice(4, 7)).map(
                (paragraph) => (
                  <p key={paragraph} className="mt-3 first:mt-0">
                    {paragraph}
                  </p>
                ),
              )}
            </div>
          </div>

          <div className="order-4 min-[1023px]:order-none">
            <h1 className="hidden text-[28px] font-medium leading-[1.2] min-[1023px]:block min-[1420px]:text-[31px] min-[1900px]:text-[36px]">
              {title}
            </h1>

            <div className="mt-4 hidden items-center gap-3 text-[#1C100E] min-[1023px]:flex">
              <span className="text-[12px]">0</span>
              <Heart className="size-4" aria-hidden="true" />
              <span className="text-[12px]">0</span>
              <MessageSquare className="size-4" aria-hidden="true" />
              <Bookmark className="size-4" aria-hidden="true" />
            </div>

            <div className="mt-4 space-y-3 text-[12px] leading-[1.45] text-[#1C100E]/82 min-[744px]:text-[13px] min-[1420px]:text-[14px]">
              {leadParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {topGalleryImages.length > 0 && (
              <div className="mt-5 grid gap-4 min-[744px]:grid-cols-2 min-[1023px]:mt-6 min-[1023px]:gap-5 min-[1420px]:gap-6">
                {topGalleryImages.map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt=""
                    className="aspect-[1.55] w-full rounded-[8px] object-cover"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {closingParagraphs.length > 0 && (
          <div className="mt-5 max-w-[520px] space-y-3 text-[12px] leading-[1.45] text-[#1C100E]/82 min-[744px]:text-[13px] min-[1023px]:ml-[367px] min-[1420px]:ml-[412px] min-[1420px]:text-[14px] min-[1900px]:ml-[480px]">
            {closingParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        )}

        {bottomGalleryImages.length > 0 && (
          <div className="mt-7 grid grid-cols-2 gap-3 min-[744px]:gap-5 min-[1023px]:grid-cols-3 min-[1023px]:gap-6 min-[1420px]:mt-8">
            {bottomGalleryImages.map((image, index) => (
              <img
                key={`${image}-${index}`}
                src={image}
                alt=""
                className="aspect-[1.55] w-full rounded-[8px] object-cover"
              />
            ))}
          </div>
        )}

        <section className="mt-7 border-t border-[#40213F]/45 pt-6 min-[744px]:mt-8 min-[1023px]:pt-7">
          <h2 className="text-[14px] font-medium min-[744px]:text-[16px]">
            {t("eventComments.title")} ( {comments.length} )
          </h2>

          <form onSubmit={handleCommentSubmit} className="mt-5 max-w-[620px]">
            <label
              htmlFor="event-comment-author"
              className="flex items-center gap-3 text-[12px] text-[#1C100E]/78"
            >
              <CircleUserRound className="size-6" aria-hidden="true" />
              {t("eventComments.reply")}
            </label>

            <Input
              id="event-comment-author"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              maxLength={80}
              required
              placeholder={t("eventComments.author")}
              className="sr-only"
            />

            <div className="mt-5 grid gap-3 min-[744px]:grid-cols-[1fr_180px] min-[1023px]:grid-cols-[1fr_210px]">
              <div>
                <Input
                  value={commentText}
                  onChange={(event) => {
                    if (!author.trim()) setAuthor(t("eventComments.guest"));
                    setCommentText(event.target.value);
                  }}
                  maxLength={1000}
                  required
                  placeholder={t("eventComments.placeholderShort")}
                  className="h-8 rounded-[30px] border-[#40213F] bg-transparent px-4 font-montserrat text-[12px] focus-visible:ring-[#40213F]"
                />
                <p className="mt-2 text-[10px] leading-[1.3] text-[#1C100E]/65">
                  {t("eventComments.authNotice")}
                </p>
              </div>

              <Button
                type="submit"
                disabled={isCommentSubmitting}
                className="h-9 rounded-[30px] bg-white px-8 font-montserrat text-[12px] font-medium text-[#1C100E] hover:bg-white/85 disabled:opacity-70"
              >
                {isCommentSubmitting
                  ? t("eventComments.sending")
                  : t("eventComments.send")}
              </Button>
            </div>
          </form>

          {commentError && (
            <p className="mt-3 text-[12px] text-[#83105F]">{commentError}</p>
          )}

          <div className="mt-5 grid gap-3">
            {comments.map((comment) => (
              <article key={comment.id} className="max-w-[620px] rounded-[8px] bg-[#FFF7FF] p-4">
                <h3 className="text-[13px] font-medium">{comment.author}</h3>
                <p className="mt-2 text-[12px] leading-[1.45] text-[#1C100E]/80">
                  {comment.text}
                </p>
              </article>
            ))}
          </div>
        </section>
      </article>
    </section>
  );
}
