import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSpecialists, type Specialist } from "../../api/specialists";
import { useTranslation } from "react-i18next";
import "./Specialists.css";

type Props = {
  limit?: number;
  isSlider?: boolean;
  variant?: "default" | "home";
};

export function Specialists({ limit, isSlider = false, variant = "default" }: Props) {
  const [data, setData] = useState<Specialist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { i18n, t } = useTranslation();

  useEffect(() => {
    let isMounted = true;

    getSpecialists()
      .then((res) => {
        if (!isMounted) return;
        setData(limit ? res.slice(0, limit) : res);
      })
      .catch(() => {
        if (!isMounted) return;
        setHasError(true);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [limit]);

  const isHomeSlider = isSlider && variant === "home";

  const sectionClass = isSlider
    ? isHomeSlider
      ? "specialists-home-slider mt-6 flex w-full snap-x snap-mandatory overflow-x-auto px-0 pb-2 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mt-10"
      : "mt-6 flex w-full snap-x snap-mandatory gap-4 overflow-x-auto px-0 pb-2 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mt-10 xl:gap-20 min-[1900px]:gap-36"
    : "mx-auto grid w-full max-w-[1180px] grid-cols-1 justify-items-center gap-x-10 gap-y-12 px-5 pt-8 sm:grid-cols-2 sm:px-10 sm:pt-12 lg:grid-cols-3 min-[1023px]:px-16 min-[1420px]:max-w-[1260px] min-[1440px]:max-w-[calc(100vw-160px)] min-[1420px]:gap-y-20 min-[1900px]:max-w-[1740px] min-[1908px]:max-w-[calc(100vw-160px)] min-[1900px]:grid-cols-3 min-[1900px]:gap-x-36 min-[1900px]:gap-y-28";

  const articleClass = isSlider
    ? isHomeSlider
      ? "specialists-home-card flex shrink-0 snap-start flex-col items-center px-0 pb-4 pt-0"
      : "flex w-[120px] shrink-0 snap-start flex-col items-center px-1 pb-4 pt-0 sm:w-[220px] xl:w-[280px] min-[1900px]:w-[360px]"
    : "specialists-page-card group flex w-full max-w-[260px] flex-col items-center rounded-[8px] px-2 pb-5 pt-0 text-center outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-[#40213F] sm:max-w-[280px] min-[1420px]:max-w-[320px] min-[1900px]:max-w-[420px]";

  const imageClass = isHomeSlider
    ? "specialists-home-image mx-auto inline-block rounded-full object-cover"
    : isSlider
      ? "mx-auto mb-3 inline-block h-[120px] w-[120px] rounded-full object-cover sm:h-[220px] sm:w-[220px] xl:h-[280px] xl:w-[280px] min-[1900px]:h-[360px] min-[1900px]:w-[360px]"
      : "mx-auto mb-4 inline-block h-[184px] w-[184px] rounded-full object-cover transition duration-200 group-hover:scale-[1.02] sm:h-[220px] sm:w-[220px] min-[1420px]:h-[280px] min-[1420px]:w-[280px] min-[1900px]:h-[360px] min-[1900px]:w-[360px]";

  const titleClass = isHomeSlider
    ? "specialists-home-title text-center font-montserrat font-medium leading-[1.2] text-[#1C100E]"
    : isSlider
      ? "mb-2 text-center font-montserrat text-[16px] font-medium leading-[1.2] text-[#1C100E] sm:mb-3 sm:text-2xl"
      : "mb-2 text-center font-montserrat text-[18px] font-medium leading-[1.2] text-[#1C100E] sm:text-[22px] min-[1420px]:text-2xl min-[1900px]:text-[32px]";

  const roleClass = isHomeSlider
    ? "specialists-home-role text-center font-montserrat font-normal leading-[140%] text-[#1C100E]"
    : isSlider
      ? "text-center font-montserrat text-[12px] font-normal leading-[140%] text-[#1C100E] sm:text-lg"
      : "text-center font-montserrat text-[13px] font-normal leading-[140%] text-[#1C100E] sm:text-[16px] min-[1420px]:text-lg min-[1900px]:text-2xl";

  const isUkrainian = i18n.language === "ua" || i18n.language === "uk";

  const removeTrainerLine = (role: string) => {
    const trainerMarkers = [
      "trainer",
      "\u0442\u0440\u0435\u043d\u0435\u0440",
      "\u00d1\u0082\u00d1\u0080\u00d0\u00b5\u00d0\u00bd\u00d0\u00b5\u00d1\u0080",
    ];

    return role
      .split(",")
      .map((part) => part.trim())
      .filter((part) => {
        const normalizedPart = part.toLowerCase();
        return !trainerMarkers.some((marker) => normalizedPart.includes(marker));
      })
      .join(", ");
  };

  const renderCard = (item: Specialist) => {
    const name = isUkrainian ? item.nameUa : item.nameEn;
    const role = isUkrainian ? item.roleUa : item.roleEn;
    const displayRole = item.id === 1 ? removeTrainerLine(role) : role;
    const content = (
      <>
        <img
          className={imageClass}
          src={item.photo}
          alt={name}
        />

        <h3 className={titleClass}>
          {name}
        </h3>

        <p className={roleClass}>
          {displayRole}
        </p>
      </>
    );

    return isHomeSlider ? (
      <Link
        key={item.id}
        to={`/specialists/${item.id}`}
        className={articleClass}
        aria-label={`${name}. ${displayRole}`}
      >
        {content}
      </Link>
    ) : isSlider ? (
      <article key={item.id} className={articleClass}>
        {content}
      </article>
    ) : (
      <Link
        key={item.id}
        to={`/specialists/${item.id}`}
        className={articleClass}
        aria-label={`${name}. ${displayRole}`}
      >
        {content}
      </Link>
    );
  };

  if (!isSlider) {
    return (
      <section
        className="w-full bg-secondary pb-20 pt-10 font-montserrat
         text-[#1C100E] sm:pb-24 sm:pt-14 min-[1420px]:pb-32
         min-[1420px]:pt-20 min-[1900px]:pb-44"
      >
        <div
          className="mx-auto w-full max-w-295 px-5 sm:px-10 min-[1023px]:px-16
          min-[1420px]:max-w-315 min-[1440px]:max-w-[calc(100vw-160px)] min-[1900px]:max-w-435 min-[1908px]:max-w-[calc(100vw-160px)]">
          <h1
            className="text-center text-[28px] font-medium leading-[1.2] 
            sm:text-[36px] min-[1420px]:text-[48px] min-[1900px]:text-[64px]">
            {t("specialistsTitle")}
          </h1>
        </div>

        {isLoading ? (
          <p className="mt-12 text-center text-[16px] min-[1420px]:text-xl">
            {t("specialistsLoading")}
          </p>
        ) : (
          <>
            {hasError && (
              <p className="mt-6 text-center text-[14px] text-[#7A1E1E] min-[1420px]:text-base">
                {t("specialistsLoadError")}
              </p>
            )}

            <div className={sectionClass}>
              {data.map(renderCard)}
            </div>
          </>
        )}
      </section>
    );
  }

  return (
    <section className={sectionClass}>
      {data.map(renderCard)}
    </section>
  );
}
