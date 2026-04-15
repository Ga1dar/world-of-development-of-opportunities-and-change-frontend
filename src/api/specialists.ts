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
      photo: "/rectangle 2.png",
      nameUa: "Іван Іванов",
      nameEn: "Ivan Ivanov",
      roleUa: "Психолог",
      roleEn: "Psychologist",
    },
    {
      id: 2,
      photo: "/rectangle 2.png",
      nameUa: "Марія Петрова",
      nameEn: "Maria Petrova",
      roleUa: "Логопед",
      roleEn: "Speech therapist",
    },
    {
      id: 3,
      photo: "/rectangle 2.png",
      nameUa: "Марія Петрова",
      nameEn: "Maria Petrova",
      roleUa: "Логопед",
      roleEn: "Speech therapist",
    },
    {
      id: 4,
      photo: "/rectangle 2.png",
      nameUa: "Марія Петрова",
      nameEn: "Maria Petrova",
      roleUa: "Логопед",
      roleEn: "Speech therapist",
    },
  ]);
}