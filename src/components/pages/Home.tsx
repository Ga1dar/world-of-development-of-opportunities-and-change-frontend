import { Link } from "react-router-dom";
import { Specialists } from "./Specialists";
import { useTranslation } from "react-i18next";

export function Home() {
  const { t } = useTranslation();
  return (
    <>
      <section className="grid grid-cols-2 gap-6 items-start px-24">
        <div className="col-span-1 w-full font-montserrat font-medium text-primary-foreground md:h-17.5 md:text-2xl md:pt-36">
          {t("homeTopText")}
        </div>
        <img
          className="col-span-1 h-125 w-full"
          src="/rectangle 2.png"
          alt="Description"
        />

        <img
          className="col-span-1 w-full md:h-100 md:mt-20"
          src="/rectangle 3.png"
          alt="Description"
        />

        <div className="col-span-1 w-full font-montserrat font-medium text-primary-foreground md:mt-20">
          <h2 className="md:text-3xl md:pb-6 md:h-22.5">
            {t("homeMiddleTitle")}
          </h2>
          <div className="md:font-normal md:text-2xl md:mt-6">
            {(
              t("homeMiddleTextContent", { returnObjects: true }) as string[]
            ).join(" ")}
            <div className="homeMiddleTextContent2 md: pt-8.75">
              {t("homeMiddleTextContent2")}
            </div>
          </div>
        </div>

        <div className="col-span-2 font-montserrat font-normal text-primary-foreground md:w-full md:h-full md:mt-6 md:mb-20 md:text-2xl">
          <div className="md:mt-6 md:h-18 md:leading-9">
            {(t("homeBottomText", { returnObjects: true }) as string[]).join(
              " ",
            )}
          </div>
          <div className="flex w-full justify-between">
            <div className="md:mt-6 md:h-17.5 md:leading-8.75">
              {t("homeBottomText1")}
            </div>
            <Link
              to="/event"
              className="font-montserrat font-medium text-primary-foreground md:flex md:items-center md:justify-center md:w-102 md:h-14 md:mt-6 md:text-lg md:no-underline md:rounded-[30px] md:border-2 md:border-yellow md:bg-[linear-gradient(180deg,#FFC401_0%,#FFC021_45%,#FEFA8B_100%)] md:shadow-btn"
            >
              {t("homeBottomLink")}
            </Link>
          </div>
        </div>
      </section>

      <section className="flex flex-col justify-center items-center md:px-20 md:mb-31.25">
        <h1 className="font-montserrat font-medium text-center text-primary-foreground w-full md:text-6xl md:mb-10 md:h-25 md:leading-25">
          {t("specialistsTitle")}
        </h1>
        <div>
          <Specialists limit={4} />
        </div>
        <Link
          to="/specialists"
          className="font-montserrat font-medium text-primary-foreground self-end md:mt-40 md:flex md:items-center md:justify-center md:w-102.5 md:h-14.25 md:text-lg md:no-underline md:rounded-[30px] md:border-2 md:border-yellow md:bg-[linear-gradient(180deg,#FFC401_0%,#FFC021_45%,#FEFA8B_100%)] md:shadow-btn"
        >
          {t("homeSpecialistsLink")}
        </Link>
      </section>
    </>
  );
}
