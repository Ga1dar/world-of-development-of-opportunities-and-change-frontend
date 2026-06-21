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
  const mediumHeroParagraphs = [
    t("homeTopText1"),
    t("homeTopText2"),
    t("homeTopText3"),
  ];
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
      <section className="about-shell mx-auto flex w-full 
      max-w-7xl flex-col px-4 sm:px-10 min-[1023px]:px-16
      min-[1420px]:max-w-[1440px] min-[1420px]:px-20 min-[1900px]:max-w-[1980px] min-[1900px]:px-20 min-[1900px]:pl-[83px]">
        <article className="about-mobile">
          <h1 className="mb-5 font-montserrat text-[24px] font-medium leading-tight text-[#1C100E]">
            {t("homeTopTitle")}
          </h1>
          {renderParagraphs(paragraphs.slice(0, 1), "gap-0")}
          <img
            src="/rectangle 2.png"
            alt={imageAlt}
            className="mt-4 h-64.25 w-full rounded-[20px] object-cover "
          />
          {renderParagraphs(paragraphs.slice(1), "mt-4")}
        </article>

        <article className="about-tablet sm:grid-cols-[320px_320px] sm:gap-x-6 min-[744px]:grid-cols-[320px_320px]">
          <h1 className="col-span-2 mb-8 font-montserrat text-[32px] font-medium leading-11.25 text-[#1C100E]">
            {t("homeTopTitle")}
          </h1>
          {renderParagraphs(paragraphs.slice(0, 3), "col-start-1")}
          <img
            src="/rectangle 2.png"
            alt={imageAlt}
            className="col-start-2 row-start-2 h-64.25 w-[320px] rounded-[20px] object-cover"
          />
          {renderParagraphs(paragraphs.slice(3), "col-span-2 mt-4")}
        </article>

        <article className="about-medium">
          <div className="grid grid-cols-[minmax(0,1fr)_440px] gap-x-6">
            <div>
              <h1 className="font-montserrat text-[24px] font-medium leading-[1.2] text-[#1C100E]">
                {t("homeTopTitle")}
              </h1>
              <div className="mt-4 flex flex-col gap-2 font-montserrat text-[12px] font-normal leading-[1.35] text-[#1C100E]">
                {mediumHeroParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
            <img
              src="/rectangle 2.png"
              alt={imageAlt}
              className="h-77.75 w-110 rounded-lg object-cover"
            />
          </div>
        </article>

        <article className="about-desktop min-[1420px]:grid-cols-[635px_635px] min-[1420px]:gap-x-12">
          <h1 className="font-montserrat text-[32px] font-medium leading-11.25 text-[#1C100E]">
            {t("homeTopTitle")}
          </h1>
          <img
            src="/rectangle 2.png"
            alt={imageAlt}
            className="col-start-2 row-span-2 row-start-1 h-81.75 w-157 rounded-[20px] object-cover"
          />
          {renderParagraphs(paragraphs.slice(0, 2), "mt-9")}
          {renderParagraphs(paragraphs.slice(2), "col-span-2 mt-6")}
        </article>

        <article className="about-big min-[1900px]:grid-cols-[minmax(0,910px)_minmax(0,1fr)] min-[1900px]:gap-x-[clamp(24px,2.2vw,43px)]">
          <div className="flex h-135 flex-col justify-start">
            <h1 className="mb-8 max-w-180 font-montserrat text-[32px] font-medium leading-11.25 text-[#1C100E]">
              {t("homeTopTitle")}
            </h1>
            {renderParagraphs(paragraphs, "max-w-[820px]")}
          </div>
          <img
            src="/rectangle 2.png"
            alt={imageAlt}
            className="h-135 w-full max-w-[894px] justify-self-end rounded-[20px] object-cover"
          />
        </article>
      </section>

      <section className="mx-auto mt-16 flex w-full max-w-7xl 
      flex-col items-center justify-center px-4 sm:mt-20 sm:px-10
      min-[1023px]:px-16 min-[1420px]:max-w-[1440px] min-[1420px]:px-20
      min-[1900px]:mt-25 min-[1900px]:max-w-[1980px] min-[1900px]:px-20">
        <h2 className="w-full text-center font-montserrat text-3xl font-medium leading-[140%] text-[#1C100E] sm:text-4xl min-[1420px]:text-[56px] min-[1420px]:leading-25 min-[1900px]:mt-5">
          {t("specialistsTitle")}
        </h2>

        <Specialists isSlider limit={3} variant="home" />

        <Link
          to="/specialists"
          className="mt-6 mb-16 flex h-14.25 w-full items-center justify-center
          rounded-[30px] border-2 border-yellow
          bg-[linear-gradient(180deg,#FFC401_0%,#FFC021_45%,#FEFA8B_100%)]
          font-montserrat text-lg font-medium text-[#1C100E] no-underline
          shadow-btn sm:ml-auto sm:w-[320px] min-[1420px]:w-102.75
          min-[1900px]:w-146"
        >
          {t("homeSpecialistsLink")}
        </Link>
      </section>
    </>
  );
}
