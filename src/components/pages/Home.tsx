import { Link } from "react-router-dom";
import { Specialists } from "./Specialists";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getEvents, type EventItem } from "../../api/events";

export function Home() {
  const { t, i18n } = useTranslation();
  const [firstEvent, setFirstEvent] = useState<EventItem | null>(null);
  const lang = i18n.language.startsWith("en") ? "en" : "ua";

  const getTextField = (event: EventItem, field: "title" | "category") => {
    return event[`${field}_${lang}` as keyof EventItem] as string;
  };

  const getDescription = (event: EventItem) => {
    return event[`description_${lang}` as keyof EventItem] as string[];
  };

  useEffect(() => {
    getEvents()
      .then((events) => {
        return setFirstEvent(events[0] || null);
      })
      .catch(console.error);
  }, []);

  const paragraphs = firstEvent ? getDescription(firstEvent) : [];
  const firstThree = paragraphs.slice(0, 2);
  const rest = paragraphs.slice(2);
  const firstEventUrl = firstEvent
    ? `/events/${firstEvent.categorySlug}/${firstEvent.id}`
    : "/events";

  return (
    <>
      <section className="mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-10 min-[1420px]:max-w-[1440px] min-[1420px]:px-20 min-[1900px]:max-w-[1980px] min-[1900px]:px-20">
        <article
          className="mb-10 grid gap-4 sm:grid-cols-2 sm:grid-rows-[auto_auto_auto] 
            sm:gap-x-6 sm:gap-y-4 min-[1420px]:mb-20 min-[1420px]:grid-cols-[631px_628px]
            min-[1420px]:grid-rows-[auto_auto_auto] min-[1420px]:items-stretch min-[1420px]:gap-x-5.25
            min-[1420px]:gap-y-0 min-[1900px]:mb-19 min-[1900px]:grid-cols-[892px_856px]">
          <h3
            className="w-full font-montserrat text-[24px] 
            font-medium leading-tight text-[#1C100E]
            sm:col-span-2 sm:row-start-1 sm:text-[32px]
            sm:leading-11.25 min-[1420px]:col-span-1!
            min-[1420px]:row-start-1! min-[1420px]:mb-6
            min-[1420px]:mt-23.75 min-[1900px]:max-w-180">
            {t("homeTopTitle")}
          </h3>

          <img
            className="h-54 w-full rounded-[20px] object-cover 
            sm:col-start-2 sm:row-start-2 sm:row-end-3 
            sm:h-54 min-[1420px]:col-start-2! 
            min-[1420px]:row-start-1! min-[1420px]:row-end-4! 
            min-[1420px]:mt-23.75 min-[1420px]:h-95.25! min-[1420px]:self-start min-[1900px]:mt-20"
            src="/rectangle 2.png"
            alt="Description"
          />

          <div
            className="flex flex-col gap-3 sm:col-start-1 
            sm:row-start-2 min-[1420px]:col-start-1!
            min-[1420px]:row-start-2! min-[1420px]:gap-4
            min-[1900px]:max-w-190">
            <p
              className="w-full font-montserrat text-[16px] 
              font-normal leading-[140%] text-[#1C100E]
              min-[1420px]:text-lg min-[1900px]:text-[18px]"
            >
              {t("homeTopText1")}
            </p>
            <p
              className="w-full font-montserrat text-[16px] 
              font-normal leading-[140%] text-[#1C100E]
              min-[1420px]:text-lg min-[1900px]:text-[18px]"
            >
              {t("homeTopText2")}
            </p>
          </div>
          <p
            className="w-full font-montserrat text-[16px] 
            font-normal leading-[140%] text-[#1C100E]
            sm:col-span-2 sm:row-start-3
            min-[1420px]:col-span-1!
            min-[1420px]:col-start-1!
            min-[1420px]:row-start-3! min-[1420px]:text-lg
            min-[1900px]:max-w-190 min-[1900px]:text-[18px]"
          >
            {t("homeTopText3")}
          </p>
        </article>

        {firstEvent && (
          <>
            <article
              className="mb-14 grid gap-4 sm:grid-cols-2 sm:gap-6 
              min-[1420px]:mb-20 min-[1420px]:grid-cols-[628px_624px]
              min-[1420px]:items-stretch min-[1420px]:gap-x-7 min-[1420px]:gap-y-0
              min-[1900px]:grid-cols-[892px_856px] min-[1900px]:gap-x-13">
              <h2
                className="font-montserrat text-2xl font-medium 
                leading-tight text-[#1C100E] sm:col-span-2 sm:text-[32px] 
                sm:leading-11.25 min-[1420px]:col-span-1! min-[1420px]:col-start-2! 
                min-[1420px]:row-start-1! min-[1420px]:mb-6 min-[1420px]:w-full 
                min-[1900px]:max-w-190"
              >
                {getTextField(firstEvent, "title")}
              </h2>
              <img
                src={firstEvent.image}
                alt="test"
                className="h-60 w-full rounded-[20px] object-cover
                 sm:col-start-1 sm:row-start-2 sm:row-end-3 sm:h-82.75 
                 min-[1420px]:col-start-1! min-[1420px]:row-start-1! 
                 min-[1420px]:row-end-7! min-[1420px]:h-135! min-[1420px]:object-contain
                 min-[1420px]:self-start min-[1900px]:h-120! min-[1980px]:object-cover"
              />
              <div
                className="flex flex-col gap-4 font-montserrat 
                text-base font-normal leading-[140%] text-[#2D302D] sm:col-start-2
                sm:row-start-2 sm:text-lg 
                min-[1420px]:col-start-2! min-[1420px]:row-start-2!
                min-[1900px]:max-w-190">
                {firstThree.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
                ))}
              </div>

              {rest.map((paragraph, index) => (
                <p
                  key={index}
                  className="font-montserrat text-base 
                  font-normal leading-[140%] text-[#2D302D]
                   sm:col-span-2 sm:col-start-1 sm:text-lg 
                   min-[1420px]:col-span-1! 
                   min-[1420px]:col-start-2! 
                   min-[1900px]:max-w-190"
                >
                {paragraph}
                </p>
              ))}
               <Link
                to={firstEventUrl}
                className="mt-4 flex h-14.25 w-full items-center
                  justify-center rounded-[30px] border-2 border-yellow
                  bg-[linear-gradient(180deg,#FFC401_0%,#FFC021_45%,#FEFA8B_100%)]
                  font-montserrat text-lg font-medium
                  text-[#1C100E] no-underline shadow-btn sm:col-start-2 sm:text-lg
                  min-[1420px]:mt-6 min-[1420px]:w-102.75 min-[1420px]:justify-self-end min-[1900px]:w-146"
              >
                {t("homeBottomLink")}
              </Link>
            </article>
          </>
        )}
      </section>

      <section
        className="mx-auto flex w-full max-w-7xl 
        flex-col items-center justify-center px-4 sm:px-10 min-[1420px]:max-w-[1440px] min-[1420px]:px-20
        min-[1900px]:max-w-[1980px] min-[1900px]:px-20">
        <h1
          className="w-full text-center font-montserrat 
          text-3xl font-medium leading-[140%] text-[#1C100E]
          sm:text-4xl min-[1420px]:text-[56px]
           min-[1420px]:leading-25 min-[1900px]:mt-5"
        >
          {t("specialistsTitle")}
        </h1>

        
          <Specialists isSlider limit={3} variant="home" />
        

        <Link
          to="/specialists"
          className="mt-6 mb-16 flex h-14.25 w-full items-center
                justify-center rounded-[30px] border-2 border-yellow
                bg-[linear-gradient(180deg,#FFC401_0%,#FFC021_45%,#FEFA8B_100%)]
                font-montserrat text-lg font-medium
                text-[#1C100E] no-underline shadow-btn sm:ml-auto sm:w-[320px] 
                min-[1420px]:w-102.75 min-[1900px]:w-146"
            >
          {t("homeSpecialistsLink")}
        </Link>
      </section>
    </>
  );
}
