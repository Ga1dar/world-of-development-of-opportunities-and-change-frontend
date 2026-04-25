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
      ? "mt-6 flex w-full gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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
            ? "flex w-36 shrink-0 snap-start flex-col items-center px-2 pb-4 pt-0 sm:w-61"
            : "mt-6 flex w-36 flex-col items-center px-4 pb-4 pt-0 sm:w-61"
          }
          >
            <img
              className="inline-block h-30 w-30 rounded-[50%] mb-3 mx-auto sm:h-61 sm:w-61 "
              src={item.photo}
              alt={name}
            />

            <h3 className="font-montserrat font-medium text-center text-[sidebar] text-xl mb-3 sm:mb-4 sm:text-2xl">
              {name}
            </h3>

              <p className="font-montserrat font-medium text-[sidebar] text-center text-[10px] sm:text-lg">
              {role}
            </p>
          </article>
        );
      })}
    </section>
  );
}
