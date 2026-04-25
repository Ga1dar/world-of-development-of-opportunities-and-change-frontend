import { useEffect, useState } from "react";
import { getSpecialists, type Specialist } from "../../api/specialists";
import { useTranslation } from "react-i18next";

type Props = {
  limit?: number;
};

export function Specialists({ limit }: Props) {
  const [data, setData] = useState<Specialist[]>([]);
  const { i18n } = useTranslation();

  useEffect(() => {
    getSpecialists().then((res) => {
      setData(limit ? res.slice(0, limit) : res);
    });
  }, [limit]);

  return (
    <section className="flex h-full w-full flex-col gap-y-6 md:flex-row md:gap-x-6 md:justify-center">
      {data.map((item) => {
        const name = i18n.language === "ua" ? item.nameUa : item.nameEn;
        const role = i18n.language === "ua" ? item.roleUa : item.roleEn;

        return (
          <article
            key={item.id}
            className="w-full md:flex md:flex-col md:items-center md:gap-y-4 md:px-4 md:pb-4 md:pt-0"
          >
            <img
              className="inline-block md:w-64 md:h-64 md:rounded-full"
              src={item.photo}
              alt={name}
            />

            <h3 className="font-montserrat font-medium text-primary-foreground md:h-14 md:text-2xl">
              {name}
            </h3>

            <p className="font-montserrat font-medium text-primary-foreground md:h-6 md:text-lg">
              {role}
            </p>
          </article>
        );
      })}
    </section>
  );
}
