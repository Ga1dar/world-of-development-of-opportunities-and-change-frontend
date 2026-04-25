import { Link } from "react-router-dom";
import { Specialists } from "./Specialists";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getEvents } from "../../api/events";

type EventItem = {
  id: number;
  title_ua: string;
  title_en: string;
  description_ua: string[];
  description_en: string[];
  category_ua: string;
  category_en: string;
  image: string;
};

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
  

  return (
    <>
      <section className="flex flex-col px-4 mb-10 xl:px-20">
        <article className="mb-10 sm:grid grid-cols-2 grid-rows-[auto_auto_auto] gap-y-6 xl:gap-y-0">
          <h3 className="h-22 w-full font-montserrat font-medium text-[24px] sm:text-[32px]
          text-[sidebar] sm:col-start-1 col-span-2 row-start-1">
            {t("homeTopTitle")}
          </h3>

          <img
            className="h-54 w-full mt-6 rounded-[20px] 
            sm:mt-0 col-start-2 xl:row-start-2 xl:row-end-4
            xl:h-75"
            src="/rectangle 2.png"
            alt="Description"
          />

          <div className="mt-6 sm:mt-0 col-start-1 row-start-2">
            <p className="mt-6 sm:mt-0  w-full font-montserrat text-4 font-normal text-[sidebar] xl:text-lg">
              {t("homeTopText1")}
            </p>
            <p className="mt-4  w-full font-montserrat text-4 font-normal text-[sidebar] xl:text-lg">
              {t("homeTopText2")}
            </p>
          </div>
          <p
            className="mt-4  w-full font-montserrat text-4 
            font-normal text-[sidebar]  sm:mt-0
            col-start-1 col-span-2 row-start-3
            xl:col-start-1 xl:col-end-1 xl:row-start-3 xl:text-lg xl:mt-0">
            {t("homeTopText3")}
          </p>
        </article>

        {firstEvent && (
          <>
            <article className="mb-10 sm:grid grid-cols-2 grid-rows-[auto_auto_auto] gap-6 sm:mb-16 xl:w-full xl:gap-x-0 ">
              <h2
                className="font-montserrat font-medium 
                text-[sidebar] text-2xl h-29 w-full mb-6
                sm:text-[32px] sm:mb-0 col-start-1 col-span-2 row-start-1
                xl:col-start-2 xl:row-start-1 xl:w-full xl:pl-6"                
              >
                {getTextField(firstEvent, "title")}
              </h2>
              <img
                src={firstEvent.image}
                alt="test"
                className="mt-4 w-full rounded-[30px] sm:mt-0
                xl:col-start-1 xl:row-start-1 xl:row-end-6 xl:h-118"
              />
              <div
                className="mt-4 flex flex-col gap-4 font-montserrat font-normal 
                text-base text-[sidebar] leading-[140%] sm:mt-0 col-start-2 sm:text-lg
                xl:row-start-2 xl:pl-6">
                {firstThree.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
                ))}
              </div>

              {rest.map((paragraph, index) => (
                <p
                  key={index}
                  className="mt-4 flex flex-col gap-4 font-montserrat 
                  font-normal text-base text-[sidebar] 
                  leading-[140%] sm:mt-0 col-span-2 sm:text-lg
                  xl:col-start-2 xl:pl-6"
                >
                {paragraph}
                </p>
              ))}
               <Link
                to="/events"
                className="mt-6 flex h-14 w-full items-center
                  justify-center rounded-[30px] border-2 border-yellow
                  bg-[linear-gradient(180deg,#FFC401_0%,#FFC021_45%,#FEFA8B_100%)]
                  font-montserrat text-lg font-medium
                  text-[sidebar] no-underline shadow-btn sm:col-start-2 sm:text-lg
                  xl:w-103 xl:ml-auto"
              >
                {t("homeBottomLink")}
              </Link>
            </article>
          </>
        )}
      </section>

      <section className="flex flex-col items-center justify-center  px-4 xl:px-20">
        <h1 className="h-11 w-full text-center font-montserrat font-medium text-3xl text-[sidebar] leading-[140%] sm:text-4xl ">
          {t("specialistsTitle")}
        </h1>

        
          <Specialists isSlider />
        

        <Link
          to="/specialists"
          className="mt-6 mb-16 flex h-14 w-full items-center 
                justify-center rounded-[30px] border-2 border-yellow
                bg-[linear-gradient(180deg,#FFC401_0%,#FFC021_45%,#FEFA8B_100%)]
                font-montserrat text-lg font-medium
                text-primary-foreground no-underline shadow-btn sm:w-[320px] sm:ml-auto xl:w-103"
            >
          {t("homeSpecialistsLink")}
        </Link>
      </section>
    </>
  );
}
