// import { endpoints } from "./endpoints";

export type EventItem = {
  id: number;
  title_ua: string;
  title_en: string;
  description_ua: string[];
  description_en: string[];
  category_ua: string;
  category_en: string;
  image: "/rectangle 3.png";
};

// export async function getEvents(): Promise<EventItem[]> {
//   const response = await fetch(endpoints.events);

//   if (!response.ok) {
//     throw new Error("Failed to fetch events");
//   }

//   const data = await response.json();

//   return data.results || data;
// }

export async function getEvents(): Promise<EventItem[]> {
  return [
    {
      id: 1,
      title_ua: "Воркшоп з травмапедагогіки для педагогів позашкільної освіти",
      title_en: "Workshop on trauma pedagogy for extracurricular educators",
      description_ua: [
        "Два дні, які відчулись як одна кухня.",
        "Команда ГО «СВІТи» провела воркшоп з травмапедагогіки для педагогів позашкільної освіти. Це було більше, ніж навчання.",
        "Це були про досвід. Про проживання. Про розуміння себе і дітей поруч.",
        "Серйозні теми про травму, нервову систему і стрес дуже природно поєднувались із легкістю, сміхом і теплими вправами. Учасниці не просто слухали, вони проживали, відчували, впізнавали себе і своїх учнів у кожному прикладі.",
        "«Такі зустрічі мають бути регулярними» — звучало не раз.",
      ],
      description_en: [
        "Two days that felt like one shared space.",
        "The SVITY team held a trauma pedagogy workshop for extracurricular educators. It was more than just training.",
        "It was about experience. About living through it. About understanding yourself and the children nearby.",
        "Serious topics about trauma, the nervous system, and stress were naturally combined with ease, laughter, and warm exercises. The participants did not just listen, they lived through it, felt it, and recognized themselves and their students in every example.",
        "“These meetings should be regular,” was heard more than once.",
      ],
      category_ua: "Освіта",
      category_en: "Education",
      image: "/rectangle 3.png",
    },
  ];
}