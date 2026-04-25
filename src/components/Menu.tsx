import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogIn } from "./pages/LogIn";

type MenuProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const navLinkBase =
  "box-border flex w-full items-center justify-center font-montserrat font-medium text-[sidebar]";

const navLinkMobile =
  "h-15 text-lg min-[744px]:h-9 min-[744px]:border-b min-[744px]:border-[#D9D9D9] min-[744px]:text-[11px] min-[744px]:leading-9";

const navLinkDesktop = "xl:h-15 xl:px-4 xl:py-2 xl:text-lg";

const navLinkActive =
  "xl:rounded-[30px] xl:border xl:border-[#83105F] xl:bg-[#83105F33] xl:text-[#83105F]";

export function Menu({ isOpen, setIsOpen }: MenuProps) {
  const { t } = useTranslation();

  const closeMenu = () => setIsOpen(false);

  const getNavLinkClass = (desktopWidth: string, isActive: boolean) =>
    `${navLinkBase} ${navLinkMobile} ${navLinkDesktop} ${desktopWidth}
    ${isActive ? navLinkActive : ""}`;

  return (
    <div
      className={`${isOpen ? "flex" : "hidden"}
        fixed left-0 top-21.25 z-90 h-[calc(100vh-85px)] w-full
        flex-col items-center justify-start bg-secondary px-4 py-6

        min-[744px]:absolute min-[744px]:left-auto min-[744px]:right-5
        min-[744px]:-top-20 min-[744px]:h-auto min-[744px]:w-42
        min-[744px]:rounded-[14px] min-[744px]:bg-[#F3F2F3]
        min-[744px]:px-3 min-[744px]:py-3 min-[744px]:shadow-md

        xl:absolute xl:-top-63 xl:right-auto xl:flex xl:h-30 xl:w-full
        xl:items-center xl:bg-[#4029401A] xl:px-20 xl:py-6
        xl:shadow-none xl:rounded-none xl:pointer-events-none`}
      >
      <nav
        className="flex w-full flex-col items-center justify-center gap-6 text-center
          min-[744px]:gap-0
          xl:pointer-events-auto xl:-ml-50 xl:flex-row xl:justify-center xl:gap-x-2 xl:w-220"
      >
        <NavLink
          to="/"
          onClick={closeMenu}
          className={({ isActive }) => getNavLinkClass("xl:w-30", isActive)}
        >
          {t("aboutUs")}
        </NavLink>

        <NavLink
          to="/specialists"
          onClick={closeMenu}
          className={({ isActive }) => getNavLinkClass("xl:w-54", isActive)}
        >
          {t("specialistsTitle")}
        </NavLink>

        <NavLink
          to="/events"
          onClick={closeMenu}
          className={({ isActive }) => getNavLinkClass("xl:w-30", isActive)}
        >
          {t("events")}
        </NavLink>

        <NavLink
          to="/materials"
          onClick={closeMenu}
          className={({ isActive }) => getNavLinkClass("xl:w-60", isActive)}
        >
          {t("materials")}
        </NavLink>

        <NavLink
          to="/contacts"
          onClick={closeMenu}
          className={({ isActive }) => getNavLinkClass("xl:w-36.25", isActive)}
        >
          {t("contacts")}
        </NavLink>
      </nav>

      <Link
        to="/"
        onClick={closeMenu}
        className="mb-6 h-15 w-90 cursor-pointer rounded-[30px]
        border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8]
        text-center font-montserrat text-[18px] font-medium leading-14.25
        text-[sidebar] shadow-btn sm:hidden"
      >
        {t("support")}
      </Link>

      <div
        className="mt-4 w-full xl:hidden
        min-[744px]:mt-3
        min-[744px]:flex
        min-[744px]:justify-center

        min-[744px]:[&_button]:h-7
        min-[744px]:[&_button]:w-full
        min-[744px]:[&_button]:rounded-[30px]
        min-[744px]:[&_button]:text-[11px]

        min-[744px]:[&_a]:h-7
        min-[744px]:[&_a]:w-full
        min-[744px]:[&_a]:rounded-[30px]
        min-[744px]:[&_a]:text-[11px]"
      >
        <LogIn variant="menu" />
      </div>
    </div>
  );
}