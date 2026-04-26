import { useEffect, useState } from "react";
import { getSpecialists, type Specialist } from "../../api/specialists";
import { useTranslation } from "react-i18next";

type Props = {
  limit?: number;
  isSlider?: boolean;
};

export function Specialists({ limit, isSlider = false }: Props) {
  const [data, setData] = useState<Specialist[]>([]);
  const { i18n } = useTranslation();

  useEffect(() => {
    getSpecialists().then((res) => {
      setData(limit ? res.slice(0, limit) : res);
    });
  }, [limit]);

  return (
    <section className={
    isSlider
      ? "mt-6 flex w-full gap-4 overflow-x-auto px-0 pb-2 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mt-10 xl:grid xl:grid-cols-3 xl:gap-20 xl:overflow-visible min-[1900px]:gap-36"
      : "mt-6 flex w-full flex-wrap justify-center px-4"
  }>
      {data.map((item) => {
        const name = i18n.language === "ua" ? item.nameUa : item.nameEn;
        const role = i18n.language === "ua" ? item.roleUa : item.roleEn;

        return (
          <article
            key={item.id}
            className={
             isSlider
            ? "flex w-[120px] shrink-0 snap-start flex-col items-center px-1 pb-4 pt-0 sm:w-[220px] xl:w-[280px] min-[1900px]:w-[360px]"
            : "mt-6 flex w-36 flex-col items-center px-4 pb-4 pt-0 sm:w-61"
          }
          >
            <img
              className="mx-auto mb-3 inline-block h-[120px] w-[120px] rounded-full object-cover sm:h-[220px] sm:w-[220px] xl:h-[280px] xl:w-[280px] min-[1900px]:h-[360px] min-[1900px]:w-[360px]"
              src={item.photo}
              alt={name}
            />

            <h3 className="mb-2 text-center font-montserrat text-[16px] font-medium leading-[1.2] text-[#1C100E] sm:mb-3 sm:text-2xl">
              {name}
            </h3>

              <p className="text-center font-montserrat text-[12px] font-normal leading-[140%] text-[#1C100E] sm:text-lg">
              {role}
            </p>
          </article>
        );
      })}
    </section>
  );
}
