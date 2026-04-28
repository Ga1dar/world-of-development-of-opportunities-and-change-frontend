export type Specialist = {
  id: number;
  photo?: string;
  nameUa: string;
  nameEn: string;
  roleUa: string;
  roleEn: string;
};

export async function getSpecialists(): Promise<Specialist[]> {
  // шляпа: заменить промис const response = await fetch("https://сервер.com/specialists");
  // return response.json();
  return Promise.resolve([
    {
      id: 1,
      photo: "/lashenko 1.png",
      nameUa: "Ляшенко Альона",
      nameEn: "Alona Liashenko",
      roleUa: "Кризова психологиня Травмопедагогиня",
      roleEn: "Crisis Psychologist Trauma Pedagogue",
    },
    {
      id: 2,
      photo: "/romanova 1.png",
      nameUa: "Романова Ганна",
      nameEn: "Hanna Romanova",
      roleUa: "Травмопедагогиня",
      roleEn: "Trauma-Informed Educator",
    },
    {
      id: 3,
      photo: "/andruschenko.png",
      nameUa: "Наталія Андрущенко",
      nameEn: "Nataliia Andrushchenko",
      roleUa: "Координаторка",
      roleEn: "Coordinator",
    },
    {
      id: 4,
      photo: "/rectangle 2.png",
      nameUa: "Марія Петрова",
      nameEn: "Maria Petrova",
      roleUa: "Логопед",
      roleEn: "Speech therapist",
    },
    {
      id: 5,
      photo: "/rectangle 2.png",
      nameUa: "Марія Петрова",
      nameEn: "Maria Petrova",
      roleUa: "Логопед",
      roleEn: "Speech therapist",
    },
    {
      id: 6,
      photo: "/rectangle 2.png",
      nameUa: "Марія Петрова",
      nameEn: "Maria Petrova",
      roleUa: "Логопед",
      roleEn: "Speech therapist",
    },
    {
      id: 7,
      photo: "/rectangle 2.png",
      nameUa: "Марія Петрова",
      nameEn: "Maria Petrova",
      roleUa: "Логопед",
      roleEn: "Speech therapist",
    },
    {
      id: 8,
      photo: "/rectangle 2.png",
      nameUa: "Марія Петрова",
      nameEn: "Maria Petrova",
      roleUa: "Логопед",
      roleEn: "Speech therapist",
    },
    {
      id: 9,
      photo: "/rectangle 2.png",
      nameUa: "Марія Петрова",
      nameEn: "Maria Petrova",
      roleUa: "Логопед",
      roleEn: "Speech therapist",
    },
  ]);
}
