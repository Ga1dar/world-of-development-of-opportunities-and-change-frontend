import { useTranslation } from "react-i18next";

type TeamMember = {
  nameUa: string;
  nameEn: string;
  roleUa: string;
  roleEn: string;
};

const teamMembers: TeamMember[] = [
  {
    nameUa: "Губрик Світлана",
    nameEn: "Hubryk Svitlana",
    roleUa: "UI/UX дизайнерка",
    roleEn: "UI/UX Designer",
  },
  {
    nameUa: "Голіков Кирило",
    nameEn: "Holikov Kyrylo",
    roleUa: "Frontend розробник",
    roleEn: "Frontend Developer",
  },
  {
    nameUa: "Вікторія Омельяненко",
    nameEn: "Viktoriia Omelianenko",
    roleUa: "Backend розробниця, Python",
    roleEn: "Backend Developer, Python",
  },
  {
    nameUa: "Юрій Палагіцький",
    nameEn: "Yurii Palahitskyi",
    roleUa: "Backend розробник, Python",
    roleEn: "Backend Developer, Python",
  },
  {
    nameUa: "Влад Несвіта",
    nameEn: "Vlad Nesvita",
    roleUa: "Project Manager",
    roleEn: "Project Manager",
  },
  {
    nameUa: "Владислав Козлов",
    nameEn: "Vladyslav Kozlov",
    roleUa: "DevOps Engineer",
    roleEn: "DevOps Engineer",
  },
  {
    nameUa: "Марина Кравчук",
    nameEn: "Maryna Kravchuk",
    roleUa: "Кураторка від Meta Academy",
    roleEn: "Meta Academy Curator",
  },
  {
    nameUa: "Людмила Зубашич",
    nameEn: "Lyuda Zubashych",
    roleUa: "QA тестувальниця",
    roleEn: "QA Tester",
  },
  {
    nameUa: "Леся Старовойтова",
    nameEn: "Lesia Starovoytova",
    roleUa: "Project Manager",
    roleEn: "Project Manager",
  },
  {
    nameUa: "Герман Русанов",
    nameEn: "Herman Rusanov",
    roleUa: "Учасник команди розробки",
    roleEn: "Development Team Contributor",
  },
  {
    nameUa: "Ольга Гуніч",
    nameEn: "Olha Hunich",
    roleUa: "Учасниця команди розробки",
    roleEn: "Development Team Contributor",
  },
  {
    nameUa: "Вікторія Б.",
    nameEn: "Viktoriia B.",
    roleUa: "Учасниця команди розробки",
    roleEn: "Development Team Contributor",
  },
  {
    nameUa: "Роман Місюра",
    nameEn: "Roman Misiura",
    roleUa: "Учасник команди розробки",
    roleEn: "Development Team Contributor",
  },
];

const isEnglishLanguage = (language: string) => language.toLowerCase().startsWith("en");

export function DevelopersPage() {
  const { i18n } = useTranslation();
  const isEnglish = isEnglishLanguage(i18n.language);

  return (
    <section className="bg-secondary px-4 pb-16 pt-8 font-montserrat text-[#1C100E] sm:px-10 sm:pb-20 min-[1023px]:px-16 min-[1420px]:px-20 min-[1420px]:pb-28 min-[1420px]:pt-[100px] min-[1900px]:pb-36 min-[1900px]:pt-[120px]">
      <div className="mx-auto w-full max-w-[1180px] min-[1420px]:max-w-[1260px] min-[1900px]:max-w-[1740px]">
        <h1 className="text-center text-[28px] font-medium leading-[1.2] sm:text-[36px] min-[1420px]:text-[56px] min-[1420px]:leading-[100px]">
          {isEnglish ? "Project Team" : "Команда проєкту"}
        </h1>

        <div className="mx-auto mt-8 flex w-full max-w-[720px] flex-col border-y border-[#402940]/15 min-[1420px]:mt-12 min-[1900px]:max-w-[860px]">
          {teamMembers.map((member) => {
            const primaryName = isEnglish ? member.nameEn : member.nameUa;
            const secondaryName = isEnglish ? member.nameUa : member.nameEn;
            const role = isEnglish ? member.roleEn : member.roleUa;

            return (
              <article
                key={`${member.nameEn}-${member.roleEn}`}
                className="grid gap-1 border-b border-[#402940]/15 py-4 last:border-b-0 min-[1420px]:py-5"
              >
                <h2 className="text-[18px] font-medium leading-[1.25] min-[1420px]:text-[22px] min-[1900px]:text-[24px]">
                  {primaryName}
                </h2>
                <p className="text-[13px] leading-[1.35] text-[#1C100E]/65 min-[1420px]:text-[15px] min-[1900px]:text-[16px]">
                  {secondaryName}
                </p>
                <p className="text-[14px] leading-[1.35] text-[#402940] min-[1420px]:text-[16px] min-[1900px]:text-[18px]">
                  {role}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
