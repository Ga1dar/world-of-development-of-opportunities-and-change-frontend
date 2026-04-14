import { Link } from "react-router-dom";
import { Specialists } from "../Specialists";

export function Home() {
  return (
    <>
      <section className="grid grid-cols-2 gap-6 items-start px-24">
        <div className="col-span-1 w-full font-montserrat font-medium text-primary-foreground md:h-17.5 md:text-2xl md:pt-36">
          Простір розвитку та ментального здоров'я для дітей і дорослих
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
            Хто подбає про тих, хто підтримує інших?
          </h2>
          <div className="md:font-normal md:text-2xl md:mt-6">
            Робота вчителя — це більше, ніж професія. Це щоденне проживання
            чужих емоцій. Радість, сміх і захоплення дітей, але водночас — їхній
            страх, розпач, невпевненість роздратування й агресія. Усе це
            проходить крізь серце кожної освітянки щодня.
            <div className="pt-9">
              Та хто подбає про тих, хто підтримує інших?
            </div>
          </div>
        </div>

        <div className="col-span-2 font-montserrat font-normal text-primary-foreground md:w-full md:h-full md:mt-6 md:mb-20 md:text-2xl">
          <div className="md:mt-6 md:h-18 md:leading-9">
            Хто допоможе впоратися з дитячими емоціями, ще й у поєднанні з
            власними переживаннями, втомою та відповідальністю?
          </div>
          <div className="flex w-full justify-between">
            <div className="md:mt-6 md:h-17.5 md:leading-8.75">
              ГО «СВІТИ» запрошує освітян на простір підтримки, навчання та
              відновлення.
            </div>
            <Link
              to="/event"
              className="font-montserrat font-medium text-primary-foreground md:flex md:items-center md:justify-center md:w-102 md:h-14 md:mt-6 md:text-lg md:no-underline md:rounded-[30px] md:border-2 md:border-yellow md:bg-[linear-gradient(180deg,#FFC401_0%,#FFC021_45%,#FEFA8B_100%)] md:shadow-btn"
            >
              Деталі події
            </Link>
          </div>
        </div>
      </section>

      <section className="flex flex-col justify-center items-center md:px-20 md:mb-31.25">
        <h1 className="font-montserrat font-medium text-primary-foreground w-full md:text-6xl md:mb-10 md:h-25 md:leading-25">
          Наші Спеціалісти
        </h1>
        <div>
          <Specialists limit={4} />
        </div>
        <Link
          to="/specialists"
          className="font-montserrat font-medium text-primary-foreground self-end md:mt-40 md:flex md:items-center md:justify-center md:w-102.5 md:h-14.25 md:text-lg md:no-underline md:rounded-[30px] md:border-2 md:border-yellow md:bg-[linear-gradient(180deg,#FFC401_0%,#FFC021_45%,#FEFA8B_100%)] md:shadow-btn"
        >
          Усі спеціалісти
        </Link>
      </section>
    </>
  );
}
