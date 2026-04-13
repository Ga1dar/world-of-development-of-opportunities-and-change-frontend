import { Link } from "react-router-dom";
import "./Home.css";
import { Specialists } from "../specialists/Specialists";

export function Home() {
  return (
    <>
      <section className="homeSection">
        <div className="homeTopText">
          Простір розвитку та ментального здоров’я для дітей і дорослих
        </div>
        <img
          className="homeTopImg"
          src="/rectangle 2.png"
          alt="Description"
        ></img>

        <img
          className="homeMiddleImg"
          src="/rectangle 3.png"
          alt="Description"
        ></img>
        <div className="homeMiddleText">
          <h2 className="homeMiddleTitle">
            Хто подбає про тих, хто підтримує інших?
          </h2>
          <div className="homeMiddleTextContent">
            Робота вчителя — це більше, ніж професія. Це щоденне проживання
            чужих емоцій. Радість, сміх і захоплення дітей, але водночас — їхній
            страх, розпач, невпевненість роздратування й агресія. Усе це
            проходить крізь серце кожної освітянки щодня.
            <div className="md: pt-[35px]">
              Та хто подбає про тих, хто підтримує інших?
            </div>
          </div>
        </div>

        <div className="homeBottom">
          <div className="homeBottomText">
            Хто допоможе впоратися з дитячими емоціями, ще й у поєднанні з
            власними переживаннями, втомою та відповідальністю?
          </div>
          <div className="homeBottomBlock">
            <div className="homeBottomText">
              ГО «СВІТИ» запрошує освітян на простір підтримки, навчання та відновлення.
            </div>
            <Link to="/event" className="homeBottomLink">
              Деталі події
            </Link>
          </div>
        </div>
      </section>
      <section className="homeSpecialists">
        <h1 className="specialistsTitle">Наші Спеціалісти</h1>
        <div className="specialistsInfo">
          <Specialists limit={4} />
        </div>
        <Link
          to="/specialists"
          className="homeBottomLink self-end-safe md:mt-40"
        >
          Усі спеціалісти
        </Link>
      </section>
    </>
  );
}
