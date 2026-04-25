import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogIn } from "./pages/LogIn";

type MenuProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};


export function Menu({ isOpen, setIsOpen }: MenuProps) {
  const { t } = useTranslation();

  const closeMenu = () => setIsOpen(false);

  return (
    <div
      className={`${isOpen ? "flex" : "hidden"}
       xl:flex h-full w-full flex-col items-center
       justify-start bg-secondary px-4 py-6 mb-16
        xl:bg-[#4029401A] xl:absolute xl:h-30 xl:-top-63 xl:px-20 xl:items-center`} >
      <nav
        className="flex w-full flex-col items-center 
        justify-center text-center gap-6 xl:flex-row
        xl:gap-x-2 xl:-ml-45 xl:justify-center xl:px-20"
      >
        <NavLink
          to="/"
          onClick={closeMenu}
          className={({ isActive }) =>
            `sm:w-27.5 xl:w-30 xl:flex xl:justify-center xl:px-4 xl:py-2 z-51
            font-montserrat font-medium h-15
             w-full text-lg text-[sidebar] xl:items-center box-border
             ${isActive ? "xl:bg-[#83105F33] xl:rounded-[30px] xl:border xl:border-[#83105F] xl:text-[#83105F]"
              : "xl:flex font-montserrat font-medium h-15 w-full text-lg text-[sidebar] xl:items-center"}`
          }
        >
          {t("aboutUs")}
        </NavLink>

        <NavLink
          to="/specialists"
          onClick={closeMenu}
          className={({ isActive }) =>
            `sm:w-52 xl:w-54 xl:flex xl:justify-center xl:px-4 xl:py-2 font-montserrat font-medium
             h-15 w-full text-lg text-[sidebar] justify-center xl:items-center box-border
            ${isActive ? "xl:bg-[#83105F33] xl:rounded-[30px] xl:border xl:border-[#83105F] xl:text-[#83105F]"
              : "xl:flex font-montserrat font-medium h-15 w-full text-lg text-[sidebar] xl:justify-center box-border"}`
          }
        >
          {t("specialistsTitle")}
        </NavLink>

        <NavLink
          to="/events"
          onClick={closeMenu}
          className={({ isActive }) =>
            `sm:w-20.25 xl:flex xl:justify-center xl:px-4 xl:py-2 font-montserrat
            font-medium h-15 w-full text-lg text-[sidebar] xl:items-center box-border
             ${isActive ? "xl:bg-[#83105F33] xl:rounded-[30px] xl:border xl:border-[#83105F] xl:text-[#83105F]"
              : "font-montserrat font-medium h-15 w-full text-lg text-[sidebar] box-border"}`
          }
        >
          {t("events")}
        </NavLink>

        <NavLink
          to="/materials"
          onClick={closeMenu}
          className={({ isActive }) =>
            ` xl:w-60 xl:flex xl:justify-center xl:items-center xl:px-4 xl:py-2
             font-montserrat font-medium h-15 w-full text-lg text-[sidebar] box-border
               ${isActive ? "xl:bg-[#83105F33] xl:rounded-[30px] xl:border xl:border-[#83105F] xl:text-[#83105F]"
              : "font-montserrat font-medium h-15 w-full text-lg text-[sidebar] xl:w-54 box-border"}`
          }
        >
          {t("materials")}
        </NavLink>

        <NavLink
          to="/contacts"
          onClick={closeMenu}
          className={({ isActive }) =>
            `sm:w-36.25 xl:flex xl:justify-center xl:items-center xl:px-4 xl:py-2
           font-montserrat font-medium h-15 text-lg text-[sidebar] box-border
            ${isActive ? "xl:bg-[#83105F33] xl:rounded-[30px] xl:border xl:border-[#83105F] xl:text-[#83105F]"
            : "font-montserrat font-medium h-15 w-full text-lg text-[sidebar] box-border"}`
          }
        >
          {t("contacts")}
        </NavLink>
      </nav>

      <Link to="/"
         className="w-90 sm:w-full sm:hidden cursor-pointer rounded-[30px] 
              border-2 border-[#FEF85C] text-center font-montserrat font-medium 
              text-[18px] leading-14.25 text-[sidebar] mb-6
              shadow-btn h-15 bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8]"
        onClick={closeMenu}>
        {t("support")}
      </Link>

      <div className="mt-4 xl:hidden">
        <LogIn variant="menu" />
      </div>
    </div>
  );
}