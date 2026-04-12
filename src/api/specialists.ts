export type Specialist = {
  id: number;
  name: string;
  role: string;
  photo?: string;
};

export async function getSpecialists(): Promise<Specialist[]> {
  // шляпа: заменить промис const response = await fetch("https://сервер.com/specialists");
  // return response.json();
  return Promise.resolve([
    { id: 1, photo: "/public/rectangle 2.png", name: "Іван Іванов", role: "Психолог" },
    { id: 2, photo: "/public/rectangle 2.png", name: "Марія Петрова", role: "Логопед" },
    { id: 3, photo: "/public/rectangle 2.png", name: "Олег Сидоренко", role: "Психотерапевт" },
    { id: 4, photo: "/public/rectangle 2.png", name: "Анна Коваль", role: "Дефектолог" },
    { id: 5, photo: "/public/rectangle 2.png", name: "Test User", role: "Щось ще" },
  ]);
}