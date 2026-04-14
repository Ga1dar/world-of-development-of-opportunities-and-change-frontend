import { useEffect, useState } from "react";
import { getSpecialists, type Specialist } from "../../../api/specialists";


type Props = {
  limit?: number;
};

export function Specialists({ limit }: Props) {
  const [data, setData] = useState<Specialist[]>([]);

  useEffect(() => {
    getSpecialists().then((res) => {
      setData(limit ? res.slice(0, limit) : res);
    });
  }, [limit]);

  return (
    <section className="flex h-full w-full flex-col gap-y-6 md:flex-row md:gap-x-6 md:justify-center">
      {data.map((item) => (
        <article key={item.id} className="w-full md:flex md:flex-col md:items-center md:gap-y-4 md:px-4 md:pb-4 md:pt-0">
          <img
            className="inline-block md:w-64 md:h-64 md:rounded-full"
            src={item.photo}
            alt={item.name}
          />

          <h3 className="font-montserrat font-medium text-primary-foreground md:h-14 md:text-2xl">{item.name}</h3>
          <p className="font-montserrat font-medium text-primary-foreground md:h-6 md:text-lg">{item.role}</p>
        </article>
      ))}
    </section>
  );
}
