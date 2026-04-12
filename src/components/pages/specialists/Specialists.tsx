import { useEffect, useState } from "react";
import { getSpecialists, type Specialist } from "../../../api/specialists";
import './Specialist.css'

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
    <section className="specialistsSection">
      {data.map((item) => (
        <article key={item.id} className="specialistCard">
          <img className="specialistPhoto" src={item.photo} alt={item.name} />

          <h3 className="specialistName">{item.name}</h3>
          <p className="specialistRole">{item.role}</p>
        </article>
      ))}
    </section>
  );
}
