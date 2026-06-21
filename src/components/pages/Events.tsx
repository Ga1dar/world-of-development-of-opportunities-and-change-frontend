import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fallbackCategories,
  getEventCategories,
  type EventCategory,
} from "../../api/events";
import { useCanManageEventCategories } from "../../hooks/useCanCreateEvents";

export function Events() {
  const { i18n, t } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "ua";
  const canManageEventCategories = useCanManageEventCategories();
  const [categories, setCategories] = useState<EventCategory[]>(fallbackCategories);

  useEffect(() => {
    let isMounted = true;

    getEventCategories().then((items) => {
      if (isMounted) setCategories(items);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const getTitle = (category: EventCategory) =>
    lang === "en" ? category.title_en : category.title_ua;

  return (
    <section className="bg-secondary px-5 pb-12 pt-6 font-montserrat 
    text-[#1C100E] min-[390px]:px-8 min-[744px]:px-10 min-[744px]:pb-14 min-[744px]:pt-9 min-[1023px]:px-16 min-[1023px]:pb-16 min-[1023px]:pt-12
    min-[1420px]:px-[60px] min-[1420px]:pb-20 min-[1420px]:pt-[120px] min-[1900px]:px-[45px] min-[1900px]:pb-[142px] min-[1900px]:pt-[120px]">
      <div className="events-shell mx-auto w-full">
        <h1 className="sr-only">{t("events")}</h1>

        <div className="events-grid">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/events/${category.slug}`}
              className="events-card group rounded-[8px] bg-[#FFF7FF] p-3 
              text-center transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(64,41,64,0.14)] 
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] min-[744px]:p-3 min-[1023px]:p-3
               min-[1420px]:h-[440px] min-[1420px]:p-6 min-[1920px]:h-[440px]"
            >
              <img
                src={category.image}
                alt={getTitle(category)}
                className="aspect-[1.672] w-full rounded-[8px] object-cover"
              />
              <h2 className="mt-3 min-h-[18px] font-montserrat text-[14px] font-medium leading-[1.25] text-[#1C100E] min-[744px]:text-[12px] min-[1023px]:text-[13px] min-[1420px]:text-[16px] min-[1900px]:mt-4 min-[1900px]:text-[20px]">
                {getTitle(category)}
              </h2>
            </Link>
          ))}
        </div>

        {canManageEventCategories && (
          <Link
            to="/events/categories/new"
            className="mt-5 flex h-10 w-full max-w-[326px] items-center justify-center rounded-[30px] border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] text-center text-[12px] font-medium text-[#1C100E] shadow-btn transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] min-[744px]:ml-auto min-[744px]:mt-7 min-[744px]:max-w-[277px] min-[1023px]:mt-9 min-[1420px]:mt-10 min-[1900px]:max-w-[277px]"
          >
            Додати категорію
          </Link>
        )}
      </div>
    </section>
  );
}
