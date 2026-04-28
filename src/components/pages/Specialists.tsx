import { useEffect, useState } from "react";
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
  const { i18n } = useTranslation();

  useEffect(() => {
    getSpecialists().then((res) => {
      setData(limit ? res.slice(0, limit) : res);
    });
  }, [limit]);

  const isHomeSlider = isSlider && variant === "home";

  const sectionClass = isSlider
    ? isHomeSlider
      ? "specialists-home-slider mt-6 flex w-full snap-x snap-mandatory overflow-x-auto px-0 pb-2 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mt-10"
      : "mt-6 flex w-full snap-x snap-mandatory gap-4 overflow-x-auto px-0 pb-2 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mt-10 xl:gap-20 min-[1900px]:gap-36"
    : "mt-6 flex w-full flex-wrap justify-center px-4";

  const articleClass = isSlider
    ? isHomeSlider
      ? "specialists-home-card flex shrink-0 snap-start flex-col items-center px-0 pb-4 pt-0"
      : "flex w-[120px] shrink-0 snap-start flex-col items-center px-1 pb-4 pt-0 sm:w-[220px] xl:w-[280px] min-[1900px]:w-[360px]"
    : "mt-6 flex w-36 flex-col items-center px-4 pb-4 pt-0 sm:w-61";

  const imageClass = isHomeSlider
    ? "specialists-home-image mx-auto inline-block rounded-full object-cover"
    : "mx-auto mb-3 inline-block h-[120px] w-[120px] rounded-full object-cover sm:h-[220px] sm:w-[220px] xl:h-[280px] xl:w-[280px] min-[1900px]:h-[360px] min-[1900px]:w-[360px]";

  const titleClass = isHomeSlider
    ? "specialists-home-title text-center font-montserrat font-medium leading-[1.2] text-[#1C100E]"
    : "mb-2 text-center font-montserrat text-[16px] font-medium leading-[1.2] text-[#1C100E] sm:mb-3 sm:text-2xl";

  const roleClass = isHomeSlider
    ? "specialists-home-role text-center font-montserrat font-normal leading-[140%] text-[#1C100E]"
    : "text-center font-montserrat text-[12px] font-normal leading-[140%] text-[#1C100E] sm:text-lg";

  return (
    <section className={sectionClass}>
      {data.map((item) => {
        const isUkrainian = i18n.language === "ua" || i18n.language === "uk";
        const name = isUkrainian ? item.nameUa : item.nameEn;
        const role = isUkrainian ? item.roleUa : item.roleEn;

        return (
          <article
            key={item.id}
            className={articleClass}
          >
            <img
              className={imageClass}
              src={item.photo}
              alt={name}
            />

            <h3 className={titleClass}>
              {name}
            </h3>

              <p className={roleClass}>
              {role}
            </p>
          </article>
        );
      })}
    </section>
  );
}
