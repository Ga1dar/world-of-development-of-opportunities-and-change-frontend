import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Specialists } from "./Specialists";
import "./Aboutus.css";

export function Aboutus() {
  const { t } = useTranslation();
  const firstParagraphs = t("aboutTextFirst", {
    returnObjects: true,
  }) as string[];
  const restParagraphs = t("aboutTextRest", { returnObjects: true }) as string[];
  const paragraphs = [...firstParagraphs, ...restParagraphs];
  const imageAlt = t("aboutUs");

  const renderParagraphs = (items: string[], className = "") => (
    <div
      className={`flex flex-col gap-4 font-montserrat text-[16px] font-normal leading-[140%] text-[#1C100E] min-[1420px]:text-lg ${className}`}
    >
      {items.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );

  return (
    <>
      <section className="about-shell mx-auto flex w-full max-w-[1280px] flex-col px-4 sm:px-10 min-[1900px]:max-w-[1820px]">
        <article className="about-mobile">
          <h1 className="mb-5 font-montserrat text-[24px] font-medium leading-[1.25] text-[#1C100E]">
            {t("homeTopTitle")}
          </h1>
          {renderParagraphs(paragraphs.slice(0, 1), "gap-0")}
          <img
            src="/rectangle 2.png"
            alt={imageAlt}
            className="mt-4 h-[257px] w-full rounded-[20px] object-cover"
          />
          {renderParagraphs(paragraphs.slice(1), "mt-4")}
        </article>

        <article className="about-tablet sm:grid-cols-[320px_320px] sm:gap-x-6 min-[744px]:grid-cols-[320px_320px]">
          <h1 className="col-span-2 mb-8 font-montserrat text-[32px] font-medium leading-[45px] text-[#1C100E]">
            {t("homeTopTitle")}
          </h1>
          {renderParagraphs(paragraphs.slice(0, 3), "col-start-1")}
          <img
            src="/rectangle 2.png"
            alt={imageAlt}
            className="col-start-2 row-start-2 h-[257px] w-[320px] rounded-[20px] object-cover"
          />
          {renderParagraphs(paragraphs.slice(3), "col-span-2 mt-4")}
        </article>

        <article className="about-desktop min-[1420px]:grid-cols-[628px_628px] min-[1420px]:gap-x-6">
          <h1 className="font-montserrat text-[32px] font-medium leading-[45px] text-[#1C100E]">
            {t("homeTopTitle")}
          </h1>
          <img
            src="/rectangle 2.png"
            alt={imageAlt}
            className="col-start-2 row-span-2 row-start-1 h-[327px] w-[628px] rounded-[20px] object-cover"
          />
          {renderParagraphs(paragraphs.slice(0, 2), "mt-9")}
          {renderParagraphs(paragraphs.slice(2), "col-span-2 mt-6")}
        </article>

        <article className="about-big min-[1900px]:grid-cols-[874px_894px] min-[1900px]:gap-x-[52px]">
          <div className="flex h-[540px] flex-col justify-start">
            <h1 className="mb-8 max-w-[720px] font-montserrat text-[32px] font-medium leading-[45px] text-[#1C100E]">
              {t("homeTopTitle")}
            </h1>
            {renderParagraphs(paragraphs, "max-w-[820px]")}
          </div>
          <img
            src="/rectangle 2.png"
            alt={imageAlt}
            className="h-[540px] w-[894px] rounded-[20px] object-cover"
          />
        </article>
      </section>

      <section className="mx-auto mt-16 flex w-full max-w-[1280px] flex-col items-center justify-center px-4 sm:mt-20 sm:px-10 min-[1420px]:px-0 min-[1900px]:mt-[100px] min-[1900px]:max-w-[1820px]">
        <h2 className="w-full text-center font-montserrat text-3xl font-medium leading-[140%] text-[#1C100E] sm:text-4xl min-[1420px]:text-[56px] min-[1420px]:leading-[100px]">
          {t("specialistsTitle")}
        </h2>

        <Specialists isSlider />

        <Link
          to="/specialists"
          className="mt-6 mb-16 flex h-[57px] w-full items-center justify-center
          rounded-[30px] border-2 border-yellow
          bg-[linear-gradient(180deg,#FFC401_0%,#FFC021_45%,#FEFA8B_100%)]
          font-montserrat text-lg font-medium text-[#1C100E] no-underline
          shadow-btn sm:ml-auto sm:w-[320px] min-[1420px]:w-[411px]
          min-[1900px]:w-[584px]"
        >
          {t("homeSpecialistsLink")}
        </Link>
      </section>
    </>
  );
}
