import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  fallbackCategories,
  getEventCategories,
  type EventCategory,
} from "../../api/events";

export function Events() {
  const { i18n, t } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "ua";
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
    <section className="bg-secondary px-5 pb-12 pt-6 font-montserrat text-[#1C100E] min-[390px]:px-8 min-[744px]:px-10 min-[744px]:pb-14 min-[744px]:pt-9 min-[1023px]:px-13 min-[1023px]:pb-16 min-[1023px]:pt-12 min-[1420px]:px-20 min-[1420px]:pb-20 min-[1420px]:pt-[120px] min-[1900px]:pb-[142px] min-[1900px]:pt-[120px]">
      <div className="mx-auto w-full max-w-[326px] min-[744px]:max-w-[648px] min-[1023px]:max-w-[760px] min-[1420px]:max-w-[1134px] min-[1900px]:max-w-[1548px]">
        <h1 className="sr-only">{t("events")}</h1>

        <div className="grid grid-cols-1 gap-4 min-[744px]:grid-cols-2 min-[744px]:gap-5 min-[1023px]:gap-6 min-[1420px]:grid-cols-3 min-[1420px]:gap-6 min-[1900px]:gap-8">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/events/${category.slug}`}
              className="group rounded-[8px] bg-[#FFF7FF] p-3 text-center transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(64,41,64,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#40213F] min-[744px]:p-3 min-[1023px]:p-3 min-[1420px]:p-4"
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
      </div>
    </section>
  );
}
