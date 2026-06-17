import { type ReactNode } from "react";

const supervisionCopy = {
  ua: {
    title: "Що таке супервізія",
    intro: [
      "Супервізія — це професійний простір підтримки для фахівців, які працюють з людьми: психологів, травмапедагогів, педагогів, соціальних працівників. Це регулярні зустрічі з досвідченим супервізором, під час яких розбираються робочі випадки, складні ситуації у взаємодії з клієнтами та внутрішні реакції спеціаліста.",
      "Супервізія не є контролем чи оцінюванням. Це безпечний і конфіденційний процес, спрямований на розвиток, усвідомлення та підвищення якості професійної роботи.",
    ],
    purposeTitle: "Для чого потрібна супервізія",
    purpose: [
      "Допомагає глибше розуміти клієнта та його процес",
      "Дозволяє побачити «сліпі зони» у власній роботі",
      "Підтримує у складних або емоційно навантажених випадках",
      "Знижує ризик професійного вигорання",
      "Допомагає відокремлювати особисті переживання від роботи",
      "Зміцнює професійну впевненість і навички",
      "Дає опору в етичних питаннях і прийнятті рішень",
    ],
    whoTitle: "Кому підходить",
    who: "Супервізія буде корисною як для початківців, так і для досвідчених спеціалістів, які прагнуть розвитку, стабільності в роботі та якісної допомоги своїм клієнтам.",
    whyTitle: "Чому це важливо",
    why: "У роботі з травмою, кризами та глибокими переживаннями клієнтів фахівець постійно стикається з високим рівнем емоційної напруги. Супервізія допомагає зберегти професійну якість, внутрішню стійкість і запобігти виснаженню.",
    resultTitle: "Результат",
    result: "Супервізія — це інвестиція в якість вашої роботи, безпеку клієнтів і ваше професійне довголіття.",
  },
  en: {
    title: "What is supervision",
    intro: [
      "Supervision is a professional support space for specialists who work with people: psychologists, trauma educators, teachers, and social workers. It is a regular meeting with an experienced supervisor where work cases, difficult client situations, and the specialist's internal reactions are explored.",
      "Supervision is not control or evaluation. It is a safe and confidential process focused on growth, awareness, and improving the quality of professional work.",
    ],
    purposeTitle: "Why supervision is needed",
    purpose: [
      "Helps understand the client and their process more deeply",
      "Allows you to notice blind spots in your own work",
      "Supports you in difficult or emotionally demanding cases",
      "Reduces the risk of professional burnout",
      "Helps separate personal experiences from work",
      "Strengthens professional confidence and skills",
      "Provides support in ethical questions and decision making",
    ],
    whoTitle: "Who it is for",
    who: "Supervision is useful both for beginners and experienced specialists who seek growth, stability in their work, and high-quality support for their clients.",
    whyTitle: "Why it matters",
    why: "When working with trauma, crises, and deep client experiences, a specialist constantly faces a high level of emotional pressure. Supervision helps preserve professional quality, inner resilience, and prevents exhaustion.",
    resultTitle: "Result",
    result: "Supervision is an investment in the quality of your work, the safety of your clients, and your professional longevity.",
  },
};

type SupervisionEventContentProps = {
  lang: "ua" | "en";
  renderEventActions: () => ReactNode;
  renderComments: () => ReactNode;
};

export function SupervisionEventContent({
  lang,
  renderEventActions,
  renderComments,
}: SupervisionEventContentProps) {
  const copy = supervisionCopy[lang];

  return (
    <section
      className="bg-secondary px-[15px] pb-14 font-montserrat
      min-[744px]:px-10 min-[1023px]:px-16
      min-[1420px]:px-20 min-[1900px]:px-[45px] min-[1900px]:pb-14"
    >
      <article
        className="mx-auto w-full max-w-[358px]
        min-[744px]:max-w-[664px] min-[1023px]:max-w-[894px]
        min-[1420px]:max-w-[1280px] min-[1900px]:max-w-[1200px]"
      >
        <div
          className="relative overflow-hidden rounded-lg pt-10
          min-[744px]:pt-8 min-[1023px]:pt-9
          min-[1420px]:mt-[120px] min-[1420px]:pt-0
          min-[1900px]:mt-[120px]"
        >
          <img
            src="/supervisia.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full
            object-cover opacity-20 min-[744px]:opacity-25 min-[1420px]:opacity-30"
          />

          <div
            className="relative z-10 max-w-none text-[#2D302D]
            min-[1420px]:max-w-[1280px] min-[1900px]:max-w-[1200px]"
          >
            <h1
              className="font-montserrat text-[24px] font-medium leading-[1.2]
              tracking-normal text-[#1C100E] min-[744px]:text-[24px]
              min-[1023px]:text-[24px] min-[1420px]:text-[32px]
              min-[1420px]:leading-[1.4] min-[1900px]:text-[40px]"
            >
              {copy.title}
            </h1>
            {renderEventActions()}

            <div
              className="mt-5 space-y-4 font-montserrat text-[16px]
              font-normal leading-[1.4] tracking-normal text-[#2D302D]
              min-[744px]:text-[18px] min-[1023px]:text-[18px]
              min-[1420px]:mt-6 min-[1900px]:text-[18px]"
            >
              {copy.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}

              <section className="space-y-3">
                <h2 className="font-medium leading-[1.2] text-[#1C100E]">
                  {copy.purposeTitle}
                </h2>
                <ul className="list-disc space-y-1 pl-5">
                  {copy.purpose.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="font-medium leading-[1.2] text-[#1C100E]">
                  {copy.whoTitle}
                </h2>
                <p>{copy.who}</p>
              </section>

              <section className="space-y-3">
                <h2 className="font-medium leading-[1.2] text-[#1C100E]">
                  {copy.whyTitle}
                </h2>
                <p>{copy.why}</p>
              </section>

              <section className="space-y-3">
                <h2 className="font-medium leading-[1.2] text-[#1C100E]">
                  {copy.resultTitle}
                </h2>
                <p>{copy.result}</p>
              </section>
            </div>
          </div>
        </div>

        {renderComments()}
      </article>
    </section>
  );
}
