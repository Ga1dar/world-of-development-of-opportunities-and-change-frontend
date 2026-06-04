import { type FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bookmark, CircleUserRound, Heart, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  createEventComment,
  getEvent,
  getEventComments,
  getLocallyLikedEventIds,
  readStoredEventCommentReaction,
  toggleCommentLike,
  toggleEventLike,
  toggleStoredEventCommentLike,
  type EventComment,
  type EventItem,
} from "../../api/events";
import {
  eventToFavoriteContentItem,
  syncFavoriteContentItem,
} from "../../api/userFavorites";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { EducatorsEventContent } from "./EducatorsEventContent";
import { EventRegistrationDialog } from "./EventRegistrationDialog";
import { GenericEventContent } from "./GenericEventContent";
import { SupervisionEventContent } from "./SupervisionEventContent";
import { WorkshopEventContent } from "./WorkshopEventContent";

const eventBodyClass =
  "font-montserrat text-[16px] font-normal leading-[1.4] tracking-normal text-[#2D302D] min-[744px]:text-[18px]";

const educatorsCopy = {
  ua: {
    title: "Для освітян підтримка, розвантаження, додаткові знання",
    paragraphs: [
      "Хто подбає про тих, хто підтримує інших?",
      "Робота вчителя — це більше, ніж професія. Це щоденне проживання чужих емоцій.",
      "Радість, сміх і захоплення дітей, але водночас — їхній страх, розпач, невпевненість, роздратування й агресія.",
      "Усе це проходить крізь серце кожної освітянки щодня.",
      "Та хто подбає про тих, хто підтримує інших?",
      "Хто допоможе впоратися з дитячими емоціями, ще й у поєднанні з власними переживаннями, втомою та відповідальністю?",
      "ГО «СВІТи» запрошує освітян на простір підтримки, навчання та відновлення.",
      "Ми пропонуємо:",
      "Супервізії для вчителів — безпечний простір, де можна розібрати складні ситуації та питання, що турбують",
      "Тренінг «Дитяча травма» — про те, як підтримати дитину в складний час і не втратити себе",
      "Воркшоп — практичні інструменти для розвантаження групи й себе, перетворення булінгу на відповідальне лідерство",
      "Участь безкоштовна.",
      "Потрібно лише зареєструватися.",
      "Старт занять — лютий 2026 року",
      "Місце проведення — м. Покров",
      "Дати заходів повідомимо після реєстрації",
      "Ви не маєте залишатися з цим наодинці. Дозвольте собі підтримку.",
      "Заняття проходять у межах благодійного проєкту «Кризова педагогіка в Покрові» за підтримки Freunde der Erziehungskunst Rudolf Steiners e.V.",
    ],
  },
  en: {
    title: "Support, relief, and additional knowledge for educators",
    paragraphs: [
      "Who takes care of those who support others?",
      "A teacher's work is more than a profession. It is a daily encounter with other people's emotions.",
      "Children's joy, laughter, and curiosity, but also their fear, despair, uncertainty, irritation, and aggression.",
      "All of this passes through the heart of every educator every day.",
      "So who takes care of those who support others?",
      "Who helps them cope with children's emotions while also carrying their own experiences, fatigue, and responsibility?",
      "SVITY NGO invites educators into a space of support, learning, and recovery.",
      "We offer:",
      "Supervision for teachers: a safe space to unpack difficult situations and questions that feel heavy.",
      "Child Trauma training: how to support a child in difficult times without losing yourself.",
      "Workshop: practical tools for relieving group tension and turning bullying into responsible leadership.",
      "Participation is free.",
      "Registration is required.",
      "Start of classes: February 2026.",
      "Location: Pokrov.",
      "Event dates will be shared after registration.",
      "You do not have to remain alone with this. Allow yourself support.",
      "The classes are held as part of the charity project Crisis Pedagogy in Pokrov with the support of Freunde der Erziehungskunst Rudolf Steiners e.V.",
    ],
  },
};

void educatorsCopy;

const educatorsPageCopy = {
  ua: {
    title: "Для освітян підтримка, розвантаження, додаткові знання",
    paragraphs: [
      "Хто подбає про тих, хто підтримує інших?",
      "Робота вчителя — це більше, ніж професія. Це щоденне проживання чужих емоцій.",
      "Радість, сміх і захоплення дітей, але водночас — їхній страх, розпач, невпевненість, роздратування й агресія.",
      "Усе це проходить крізь серце кожної освітянки щодня.",
      "Та хто подбає про тих, хто підтримує інших?",
      "Хто допоможе впоратися з дитячими емоціями, ще й у поєднанні з власними переживаннями, втомою та відповідальністю?",
      "ГО «СВІТи» запрошує освітян на простір підтримки, навчання та відновлення.",
      "Ми пропонуємо:",
      "📎Супервізії для вчителів — безпечний простір, де можна розібрати складні ситуації та питання, що турбують",
      "📎Тренінг «Дитяча травма» — про те, як підтримати дитину в складний час і не втратити себе",
      "📎Воркшоп — практичні інструменти для розвантаження групи й себе, перетворення булінгу на відповідальне лідерство",
      "Участь безкоштовна.",
      "Потрібно лише зареєструватися.",
      "📅 Старт занять — лютий 2026 року",
      "📍 Місце проведення — м. Покров",
      "📌 Дати заходів повідомимо після реєстрації",
      "Ви не маєте залишатися з цим наодинці. Дозвольте собі підтримку.",
      "Заняття проходять у межах благодійного проєкту «Кризова педагогіка в Покрові» за підтримки Freunde der Erziehungskunst Rudolf Steiners e.V.",
    ],
  },
  en: {
    title: "Support, relief, and additional knowledge for educators",
    paragraphs: [
      "Who takes care of those who support others?",
      "A teacher's work is more than a profession. It is a daily encounter with other people's emotions.",
      "Children's joy, laughter, and curiosity, but also their fear, despair, uncertainty, irritation, and aggression.",
      "All of this passes through the heart of every educator every day.",
      "So who takes care of those who support others?",
      "Who helps them cope with children's emotions while also carrying their own experiences, fatigue, and responsibility?",
      "SVITY NGO invites educators into a space of support, learning, and recovery.",
      "We offer:",
      "📎Supervision for teachers: a safe space to unpack difficult situations and questions that feel heavy.",
      "📎Child Trauma training: how to support a child in difficult times without losing yourself.",
      "📎Workshop: practical tools for relieving group tension and turning bullying into responsible leadership.",
      "Participation is free.",
      "Registration is required.",
      "📅 Start of classes: February 2026.",
      "📍 Location: Pokrov.",
      "📌 Event dates will be shared after registration.",
      "You do not have to remain alone with this. Allow yourself support.",
      "The classes are held as part of the charity project Crisis Pedagogy in Pokrov with the support of Freunde der Erziehungskunst Rudolf Steiners e.V.",
    ],
  },
};

const educatorsImage = "/Rectangle освітянам.png";

const workshopPageCopy = {
  ua: {
    title: "Воркшоп з травмапедагогіки для педагогів позашкільної освіти",
    paragraphs: [
      "Два дні, які відчулись на одному диханні.",
      "Команда ГО «СВІТИ» провела воркшоп з травмапедагогіки для педагогів позашкільної освіти — і це було більше, ніж навчання.",
      "Це були про досвід. Про проживання. Про розуміння себе і дітей поруч.",
      "Серйозні теми про травму, нервову систему і стрес дуже природно поєднувались із легкістю, сміхом і теплими вправами.",
      "Учасниці не просто слухали — вони проживали, відчували, впізнавали себе і своїх учнів у кожному прикладі.",
      "Кожна зупинилась і подивилась глибше:\nяк реагує дитина, коли їй важко\nяк виглядає перевантаження\nяк важливо бути поруч — спокійно, з повагою і підтримкою.",
      "І, здається, головне, що залишилось після цих двох днів — це відчуття:",
      "-що підтримка працює",
      "-що радість — теж інструмент",
      "-що ми можемо бути для дітей опорою",
      "І це — дуже важливо!",
      "Хочете краще розуміти дітей і водночас берегти себе?",
      "Приєднуйтесь до воркшопів від ГО «СВІТи».",
      "Ваша стійкість — це ресурс для дітей.",
      "Подбаємо про себе разом з нами.",
    ],
  },
  en: {
    title: "Trauma pedagogy workshop for extracurricular educators",
    paragraphs: [
      "Two days that felt like one shared breath.",
      "The SVITY NGO team held a trauma pedagogy workshop for extracurricular educators, and it was more than training.",
      "It was about experience. About living through it. About understanding yourself and the children beside you.",
      "Serious topics about trauma, the nervous system, and stress were naturally combined with ease, laughter, and warm exercises.",
      "Participants did not just listen. They lived the material, felt it, and recognized themselves and their students in every example.",
      "Serious topics about trauma, the nervous system, and stress were naturally combined with ease, laughter, and warm exercises.",
      "Participants did not just listen. They lived the material, felt it, and recognized themselves and their students in every example.",
      "Each participant stopped and looked deeper:\nhow a child reacts when things are hard\nwhat overload looks like\nhow important it is to stay nearby calmly, respectfully, and supportively.",
      "And it seems the main thing that remained after these two days was the feeling:",
      "-that support works",
      "-that joy is also a tool",
      "-that we can be a source of stability for children",
      "And that is very important.",
      "Do you want to understand children better while also protecting yourself?",
      "Join the workshops from SVITY NGO.",
      "Your resilience is a resource for children.",
      "Let us take care of ourselves together.",
    ],
  },
};

function DecorativeSun({ className = "" }: { className?: string }) {
  return (
    <img
      src="/sun.png"
      alt=""
      aria-hidden="true"
      className={`pointer-events-none h-29.5 w-29.5
      object-contain opacity-90 min-[744px]:h-42
      min-[744px]:w-42 min-[1420px]:h-52.5
      min-[1420px]:w-52.5 ${className}`}
    />
  );
}

const getServerEventImages = (event: EventItem) =>
  Array.from(new Set([event.image, ...event.galleryImages].filter(Boolean))).slice(0, 6);

export function EventDetailPage() {
  const { eventId = "" } = useParams();
  const { i18n, t } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "ua";
  const copyLang = lang === "en" ? "en" : "ua";
  const [event, setEvent] = useState<EventItem | null>(null);
  const [comments, setComments] = useState<EventComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isEventLiked, setIsEventLiked] = useState(false);
  const [likedCommentIds, setLikedCommentIds] = useState<Set<number>>(new Set());

  const applyLocalCommentReactions = (
    eventItem: EventItem | null,
    commentItems: EventComment[],
  ) =>
    commentItems.map((comment) => {
      if (!eventItem?.isFallback) return comment;

      const reaction = readStoredEventCommentReaction(eventItem.id, comment.id);
      return reaction
        ? {
            ...comment,
            isLiked: reaction.liked,
            likesCount: reaction.likesCount,
          }
        : comment;
    });

  useEffect(() => {
    let isMounted = true;

    Promise.all([getEvent(eventId), getEventComments(eventId)]).then(
      ([eventItem, commentItems]) => {
        if (!isMounted) return;
        const hydratedComments = applyLocalCommentReactions(eventItem, commentItems);
        setEvent(eventItem);
        setComments(hydratedComments);
        setLikedCommentIds(
          new Set(
            hydratedComments
              .filter((comment) => comment.isLiked)
              .map((comment) => comment.id),
          ),
        );
        setIsEventLiked(
          Boolean(eventItem?.isLiked || (eventItem && getLocallyLikedEventIds().has(eventItem.id))),
        );
      },
    );

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  const handleCommentSubmit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    setCommentError("");

    const cleanText = commentText.trim();
    if (cleanText.length < 2) {
      setCommentError(t("eventComments.validationError"));
      return;
    }

    setIsCommentSubmitting(true);

    try {
      const created = await createEventComment(eventId, {
        text: cleanText,
      });
      setComments((current) => [created, ...current]);
      setCommentText("");
      setEvent((current) =>
        current
          ? { ...current, commentsCount: (current.commentsCount ?? comments.length) + 1 }
          : current,
      );
    } catch {
      setCommentError(t("eventComments.fallbackNotice"));
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleEventLike = async () => {
    if (!event) return;
    const targetEvent = event;
    const wasLiked = isEventLiked;
    const nextLiked = !isEventLiked;

    const applyLikeState = (liked: boolean) => {
      const delta = liked ? (wasLiked ? 0 : 1) : wasLiked ? -1 : 0;
      const nextLikesCount = Math.max((targetEvent.likesCount || 0) + delta, 0);
      const nextEvent = { ...targetEvent, likesCount: nextLikesCount, isLiked: liked };

      setIsEventLiked(liked);
      setEvent((current) =>
        current
          ? {
              ...current,
              likesCount: nextLikesCount,
              isLiked: liked,
            }
          : current,
      );
      syncFavoriteContentItem(
        eventToFavoriteContentItem(nextEvent, lang),
        liked,
      );
    };

    applyLikeState(nextLiked);

    try {
      const result = await toggleEventLike(
        targetEvent.id,
        nextLiked,
        Boolean(targetEvent.isFallback),
      );
      if (result.liked !== nextLiked) applyLikeState(result.liked);
    } catch (error) {
      console.error(error);
      setCommentError(t("eventComments.fallbackNotice"));
    }
  };

  const handleCommentLike = async (commentId: number) => {
    const targetComment = comments.find((comment) => comment.id === commentId);
    if (!targetComment) return;

    const wasLiked = likedCommentIds.has(commentId);

    if (event?.isFallback) {
      const result = toggleStoredEventCommentLike(
        event.id,
        commentId,
        wasLiked,
        targetComment.likesCount || 0,
      );

      setLikedCommentIds((current) => {
        const next = new Set(current);
        if (result.liked) next.add(commentId);
        else next.delete(commentId);
        return next;
      });

      setComments((current) =>
        current.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                isLiked: result.liked,
                likesCount: result.likesCount,
              }
            : comment,
        ),
      );
      return;
    }

    try {
      const result = await toggleCommentLike(eventId, commentId);
      const delta = result.liked ? (wasLiked ? 0 : 1) : wasLiked ? -1 : 0;

      setLikedCommentIds((current) => {
        const next = new Set(current);
        if (result.liked) next.add(commentId);
        else next.delete(commentId);
        return next;
      });

      setComments((current) =>
        current.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                isLiked: result.liked,
                likesCount: Math.max((comment.likesCount || 0) + delta, 0),
              }
            : comment,
        ),
      );
    } catch (error) {
      console.error(error);
      setCommentError(t("eventComments.fallbackNotice"));
    }
  };

  if (!event) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center bg-secondary px-5 font-montserrat text-[#1C100E] min-[1023px]:px-16">
        {t("eventsLoading")}
      </section>
    );
  }

  const rawTitle = lang === "en" ? event.title_en : event.title_ua;
  const rawDescription = lang === "en" ? event.description_en : event.description_ua;
  const isEducatorsEvent =
    event.categorySlug === "for-educators" || event.slug.includes("educator");
  const isWorkshopEvent =
    event.categorySlug === "workshop" || event.slug.includes("workshop");
  const isSupervisionEvent =
    event.categorySlug === "supervision" || event.slug.includes("supervision");
  const displayTitle = isWorkshopEvent
    ? workshopPageCopy[copyLang].title
    : isEducatorsEvent
      ? educatorsPageCopy[copyLang].title
      : rawTitle;
  const paragraphs = isWorkshopEvent
    ? workshopPageCopy[copyLang].paragraphs
    : isEducatorsEvent
      ? educatorsPageCopy[copyLang].paragraphs
      : rawDescription;
  const likesCount = event.likesCount || 0;
  const commentsCount = event.commentsCount ?? comments.length;
  const serverImages = getServerEventImages(event);
  const serverDescription = rawDescription.join(" ");

  const renderEventActions = () => (
    <div className="mt-2 flex items-center gap-2 text-[#1C100E] min-[744px]:mt-3 min-[744px]:gap-3">
      <span className="text-[12px] min-[744px]:text-[14px]">{likesCount}</span>
      <button
        type="button"
        onClick={() => void handleEventLike()}
        className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F]"
        aria-label="Like event"
      >
        <Heart
          className={`size-4 min-[744px]:size-5 ${isEventLiked ? "fill-[#1C100E]" : ""}`}
          aria-hidden="true"
        />
      </button>
      <span className="text-[12px] min-[744px]:text-[14px]">{commentsCount}</span>
      <MessageSquare className="size-4 min-[744px]:size-5" aria-hidden="true" />
      <Bookmark className="size-4 min-[744px]:size-5" aria-hidden="true" />
    </div>
  );

  const renderRegistrationButton = (className = "") => (
    <Button
      type="button"
      onClick={() => setIsRegistrationOpen(true)}
      className={`h-9 w-full max-w-[288px] rounded-[30px]
        border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700]
        via-[#FFD43B] to-[#FFF0A8] px-5 font-montserrat
        text-[13px] font-medium text-[#1C100E] shadow-btn
        hover:brightness-105 focus-visible:ring-[#40213F]
        min-[744px]:h-10 min-[744px]:max-w-85 min-[744px]:text-[14px] ${className}`}
    >
      {t("eventRegistration.open")}
    </Button>
  );

  const renderComments = (variant: "default" | "supervision" = "default") => (
    <section
      className={`relative mt-7 border-t border-[#40213F]/45 pt-5
      min-[744px]:mt-8 min-[744px]:pt-6
      ${variant === "supervision" ? "min-[1420px]:pb-15" : ""}`}
    >
      <div
        className={`absolute right-0 top-16 hidden min-[744px]:block
        ${variant === "supervision"
          ? "min-[744px]:right-10 min-[744px]:top-3 min-[1023px]:right-8 min-[1023px]:top-0 min-[1420px]:right-0 min-[1420px]:top-0 min-[1900px]:right-[calc(765px-50vw)] min-[1900px]:top-3"
          : "min-[744px]:right-8 min-[1023px]:right-16 min-[1420px]:right-24"}`}
      >
        <DecorativeSun
          className={
            variant === "supervision"
              ? "min-[744px]:!h-[319px] min-[744px]:!w-[319px] min-[1023px]:!h-[341px] min-[1023px]:!w-[341px] min-[1420px]:!h-[409px] min-[1420px]:!w-[409px]"
              : ""
          }
        />
      </div>

      <div
        className={`relative z-10 max-w-155 min-[1420px]:max-w-190
        ${variant === "supervision" ? "min-[1900px]:max-w-[894px]" : ""}`}
      >
        <h2 className="font-montserrat text-[18px] font-medium leading-[1.4] text-[#1C100E] min-[744px]:text-[20px]">
          {t("eventComments.title")} ( {commentsCount} )
        </h2>

        <form onSubmit={handleCommentSubmit} className="mt-4">
          <label
            htmlFor="event-comment-text"
            className="flex items-center gap-2 font-montserrat text-[12px] text-[#2D302D] min-[744px]:gap-3 min-[744px]:text-[14px]"
          >
            <CircleUserRound className="size-5 min-[744px]:size-6" aria-hidden="true" />
            {t("eventComments.reply")}
          </label>

          <div className="mt-3 grid gap-3">
            <div>
              <Input
                id="event-comment-text"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                maxLength={1000}
                required
                placeholder={t("eventComments.placeholderShort")}
                className={`h-8 rounded-[30px] border-[#40213F] bg-transparent
                 px-3 font-montserrat text-[12px] text-[#2D302D] focus-visible:ring-[#40213F]
                 min-[744px]:text-[14px]
                 ${variant === "supervision" ? "min-[1900px]:h-[46px]" : ""}`}
              />
              <p className="mt-1.5 font-montserrat text-[10px] leading-[1.3] text-[#2D302D]/70 min-[744px]:text-[12px]">
                {t("eventComments.authNotice")}
              </p>
            </div>

            <Button
              type="submit"
              disabled={isCommentSubmitting}
              className={`ml-auto w-full
              ${variant === "supervision" ? "h-[57px] min-[744px]:h-9 min-[1900px]:h-[57px]" : "h-8 min-[744px]:h-9"}
              ${variant === "supervision" ? "max-w-none min-[744px]:max-w-42 min-[1900px]:max-w-[277px]" : "max-w-none min-[744px]:max-w-42"}
              rounded-[30px] bg-white
              px-6 font-montserrat text-[12px]
              font-medium text-[#1C100E] hover:bg-white/85
              disabled:opacity-70 min-[744px]:text-[14px]`}
            >
              {isCommentSubmitting
                ? t("eventComments.sending")
                : t("eventComments.send")}
            </Button>
          </div>
        </form>

        {commentError && (
          <p className="mt-3 font-montserrat text-[12px] text-[#83105F]">
            {commentError}
          </p>
        )}

        <div className="mt-5 border-t border-[#40213F]/45 pt-4">
          {comments.map((comment) => (
            <article key={comment.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  {comment.userAvatar && (
                    <img
                      src={comment.userAvatar}
                      alt=""
                      className="size-6 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-montserrat text-[13px] font-medium text-[#1C100E] min-[744px]:text-[14px]">
                      {comment.author}
                    </h3>
                    {comment.createdAt && (
                      <time
                        dateTime={comment.createdAt}
                        className="font-montserrat text-[10px] text-[#2D302D]/65 min-[744px]:text-[11px]"
                      >
                        {comment.createdAt}
                      </time>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCommentLike(comment.id)}
                  className="flex items-center gap-1 rounded-full
                  font-montserrat text-[11px] text-[#1C100E]
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-[#40213F]"
                  aria-label="Like comment"
                >
                  <span>{comment.likesCount || 0}</span>
                  <Heart
                    className={`size-4 ${likedCommentIds.has(comment.id) ? "fill-[#1C100E]" : ""}`}
                    aria-hidden="true"
                  />
                </button>
              </div>
              <p className="mt-3 font-montserrat text-[12px] leading-[1.45] text-[#2D302D] min-[744px]:text-[14px]">
                {comment.text}
              </p>
            </article>
          ))}
          {!comments.length && (
            <p className="font-montserrat text-[12px] text-[#2D302D]/70 min-[744px]:text-[14px]">
              {t("eventComments.authNotice")}
            </p>
          )}
        </div>
      </div>
    </section>
  );

  const renderEducatorsRegistrationButton = (className = "") => (
    <Button
      type="button"
      onClick={() => setIsRegistrationOpen(true)}
      className={`h-[57px] w-full rounded-[30px]
        border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700]
        via-[#FFD43B] to-[#FFF0A8] px-5 font-montserrat
        text-[16px] font-medium text-[#1C100E] shadow-btn
        hover:brightness-105 focus-visible:ring-[#40213F]
        min-[744px]:text-[14px] min-[1900px]:h-16 ${className}`}
    >
      {t("eventRegistration.open")}
    </Button>
  );

  const renderEducatorsImage = (className: string, showCaption = true) => (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <img
        src={educatorsImage}
        alt={displayTitle}
        className="h-full w-full object-cover"
      />
      {showCaption && (
        <div
          className="absolute inset-x-0 bottom-2 text-center font-montserrat
          text-[24px] font-semibold leading-[1.05] text-[#5B26FF]
          min-[744px]:bottom-1 min-[744px]:text-[16px]
          min-[1023px]:bottom-3 min-[1023px]:text-[24px] min-[1420px]:hidden"
        >
          <p>ДЛЯ ОСВІТЯН</p>
          <p className="text-[13px] min-[744px]:text-[9px] min-[1023px]:text-[14px]">
            підтримка, розвантаження
          </p>
          <p className="text-[13px] min-[744px]:text-[9px] min-[1023px]:text-[14px]">
            додаткові знання
          </p>
        </div>
      )}
    </div>
  );

  const renderEducatorsText = (items: string[], className = "") => (
    <div className={`space-y-3 ${eventBodyClass} ${className}`}>
      {items.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );

  const renderEducatorsComments = () => (
    <section className="relative mt-7 border-t border-[#1C100E]/45 pt-5 min-[744px]:mt-6 min-[1023px]:mt-8">
      <div
        className="grid gap-5 min-[1023px]:block
        min-[1420px]:grid min-[1420px]:grid-cols-[845px_409px] min-[1420px]:gap-x-6
        min-[1900px]:grid-cols-[1203px_487px] min-[1900px]:gap-x-[126px]"
      >
        <div className="relative z-10 min-[1023px]:w-166.5 min-[1420px]:w-[845px] min-[1900px]:w-[1203px]">
          <h2 className="font-montserrat text-[24px] font-medium leading-[1.4] text-[#1C100E] min-[744px]:text-[20px]">
            {t("eventComments.title")} ( {commentsCount} )
          </h2>

          <form onSubmit={handleCommentSubmit} className="mt-8">
            <label
              htmlFor="educators-comment-text"
              className="flex items-center gap-3 font-montserrat text-[14px] text-[#2D302D]"
            >
              <CircleUserRound className="size-8 min-[744px]:size-6" aria-hidden="true" />
              {t("eventComments.reply")}
            </label>

            <div className="mt-5 grid gap-3">
              <div>
                <Input
                  id="educators-comment-text"
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  maxLength={1000}
                  required
                  placeholder={t("eventComments.placeholderShort")}
                  className="h-[50px] rounded-[30px] border-[#40213F] bg-transparent
                  px-4 font-montserrat text-[14px] text-[#2D302D] focus-visible:ring-[#40213F]
                  min-[744px]:h-[50px]"
                />
                <p className="mt-2 font-montserrat text-[12px] leading-[1.35] text-[#2D302D]/70">
                  {t("eventComments.authNotice")}
                </p>
              </div>

              <Button
                type="submit"
                disabled={isCommentSubmitting}
                className="ml-auto h-[57px] w-full max-w-none rounded-[30px] bg-white
                px-6 font-montserrat text-[16px] font-medium text-[#1C100E]
                hover:bg-white/85 disabled:opacity-70 min-[744px]:h-[57px] min-[744px]:max-w-[320px]
                min-[744px]:text-[14px] min-[1023px]:max-w-[206px]"
              >
                {isCommentSubmitting
                  ? t("eventComments.sending")
                  : t("eventComments.send")}
              </Button>
            </div>
          </form>

          {commentError && (
            <p className="mt-3 font-montserrat text-[12px] text-[#83105F]">
              {commentError}
            </p>
          )}

          <div className="mt-7 border-t border-[#40213F]/45 pt-4">
            {comments.map((comment) => (
              <article key={comment.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {comment.userAvatar && (
                      <img
                        src={comment.userAvatar}
                        alt=""
                        className="size-6 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-montserrat text-[16px] font-normal text-[#2D302D] min-[744px]:text-[14px]">
                        {comment.author}
                      </h3>
                      {comment.createdAt && (
                        <time
                          dateTime={comment.createdAt}
                          className="font-montserrat text-[12px] text-[#2D302D]/65 min-[744px]:text-[11px]"
                        >
                          {comment.createdAt}
                        </time>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleCommentLike(comment.id)}
                    className="flex items-center gap-1 rounded-full
                    font-montserrat text-[11px] text-[#1C100E]
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-[#40213F]"
                    aria-label="Like comment"
                  >
                    <span>{comment.likesCount || 0}</span>
                    <Heart
                      className={`size-5 ${likedCommentIds.has(comment.id) ? "fill-[#1C100E]" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <p className="mt-4 font-montserrat text-[14px] leading-[1.45] text-[#2D302D] min-[744px]:text-[12px]">
                  {comment.text}
                </p>
              </article>
            ))}
            {!comments.length && (
              <p className="font-montserrat text-[12px] text-[#2D302D]/70 min-[744px]:text-[14px]">
                {t("eventComments.authNotice")}
              </p>
            )}
          </div>
        </div>

        <img
          src="/sun.png"
          alt=""
          aria-hidden="true"
          className="z-0 hidden object-contain opacity-90 min-[1023px]:absolute
          min-[1023px]:right-0 min-[1023px]:top-0 min-[1023px]:block
          min-[1023px]:h-[341px] min-[1023px]:w-[342px]
          min-[1420px]:static min-[1420px]:h-[409px] min-[1420px]:w-[409px]
          min-[1900px]:h-[487px] min-[1900px]:w-[487px]"
        />
      </div>
    </section>
  );

  if (isEducatorsEvent) {
    return (
      <>
        <EducatorsEventContent
          displayTitle={displayTitle}
          paragraphs={paragraphs}
          renderEventActions={renderEventActions}
          renderEducatorsImage={renderEducatorsImage}
          renderEducatorsText={renderEducatorsText}
          renderEducatorsRegistrationButton={renderEducatorsRegistrationButton}
          renderEducatorsComments={renderEducatorsComments}
        />
        <EventRegistrationDialog
          eventId={event.id}
          open={isRegistrationOpen}
          onOpenChange={setIsRegistrationOpen}
        />
      </>
    );
  }

  if (isSupervisionEvent) {
    return (
      <SupervisionEventContent
        lang={copyLang}
        renderEventActions={renderEventActions}
        renderComments={() => renderComments("supervision")}
      />
    );
  }

  if (isWorkshopEvent) {
    return (
      <WorkshopEventContent
        copyLang={copyLang}
        displayTitle={displayTitle}
        paragraphs={paragraphs}
        renderEventActions={renderEventActions}
        renderComments={renderComments}
      />
    );
  }

  return (
    <>
      <GenericEventContent
        title={displayTitle}
        description={serverDescription}
        images={serverImages}
        renderEventActions={renderEventActions}
        renderComments={renderComments}
        renderRegistrationButton={renderRegistrationButton}
      />
      <EventRegistrationDialog
        eventId={event.id}
        open={isRegistrationOpen}
        onOpenChange={setIsRegistrationOpen}
      />
    </>
  );
}
