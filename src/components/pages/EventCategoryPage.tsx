import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getEventsByCategory, type EventItem } from "../../api/events";

const formatEventDate = (value: string | undefined, lang: "ua" | "en") => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const formatted = `${day}.${month}.${year}`;
  return lang === "ua" ? `${formatted}р` : formatted;
};

export function EventCategoryPage() {
  const { categorySlug = "" } = useParams();
  const { i18n, t } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "ua";
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    getEventsByCategory(categorySlug).then((eventItems) => {
      if (isMounted) setEvents(eventItems);
    });

    return () => {
      isMounted = false;
    };
  }, [categorySlug]);

  const getEventTitle = (event: EventItem) =>
    lang === "en" ? event.title_en : event.title_ua;
  const getDescription = (event: EventItem) =>
    lang === "en" ? event.description_en : event.description_ua;

  return (
    <section className="bg-secondary px-5 pb-12 pt-5 font-montserrat text-[#1C100E] min-[390px]:px-7 min-[744px]:px-10 min-[744px]:pb-14 min-[744px]:pt-7 min-[1023px]:px-12 min-[1023px]:pb-15 min-[1023px]:pt-8 min-[1420px]:px-20 min-[1420px]:pb-18 min-[1420px]:pt-6 min-[1900px]:pb-24 min-[1900px]:pt-6">
      <div className="w-full">
        <div className="grid grid-cols-1 gap-y-12 min-[744px]:gap-y-14 min-[1023px]:grid-cols-[326px_1fr] min-[1420px]:grid-cols-[360px_1fr] min-[1900px]:grid-cols-[360px_1fr]">
          <div className="flex flex-col gap-12 min-[744px]:gap-14">
            {events.map((event) => {
              const title = getEventTitle(event);
              const description = getDescription(event)[0] || "";
              const detailUrl = `/events/${event.categorySlug}/${event.id}`;

              return (
                <article
                  key={event.id}
                  className="w-full max-w-[326px] min-[390px]:max-w-none min-[744px]:max-w-[326px] min-[1023px]:max-w-[326px] min-[1420px]:max-w-[330px] min-[1900px]:max-w-[330px]"
                >
                  <h1 className="mx-auto max-w-[310px] text-center text-[15px] font-medium leading-[1.2] min-[744px]:text-[18px] min-[1023px]:text-[16px] min-[1420px]:text-[17px] min-[1900px]:text-[18px]">
                    {title}
                  </h1>

                  <Link
                    to={detailUrl}
                    className="mt-5 block rounded-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] min-[390px]:mt-5 min-[744px]:mt-6 min-[1023px]:mt-5"
                  >
                    <img
                      src={event.image}
                      alt={title}
                      className="aspect-[1.672] w-full rounded-[8px] object-cover"
                    />
                  </Link>

                  <p className="mt-5 text-[12px] leading-[1.35] text-[#1C100E]/75 min-[744px]:text-[13px] min-[1023px]:mt-5 min-[1023px]:text-[12px] min-[1420px]:text-[13px]">
                    {description}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-[11px] text-[#1C100E] min-[744px]:text-[12px]">
                    <div className="flex items-center gap-3">
                      <span>0</span>
                      <Heart className="size-4" aria-hidden="true" />
                      <span>0</span>
                      <MessageSquare className="size-4" aria-hidden="true" />
                    </div>
                    {event.eventDate && (
                      <time dateTime={event.eventDate}>
                        {formatEventDate(event.eventDate, lang)}
                      </time>
                    )}
                  </div>

                  <Link
                    to={detailUrl}
                    className="mx-auto mt-4 flex h-10 w-full max-w-[210px] items-center justify-center rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] text-center text-[13px] font-medium text-[#1C100E] shadow-btn transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] min-[744px]:mt-5 min-[744px]:max-w-[224px]"
                  >
                    {t("homeBottomLink")}
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
