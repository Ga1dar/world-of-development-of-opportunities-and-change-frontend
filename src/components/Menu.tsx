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
  "h-[43px] text-lg sm:h-9 sm:border-b sm:border-[#D9D9D9] sm:text-[11px] sm:leading-9";

const navLinkDesktop =
  "min-[1420px]:h-15 min-[1420px]:px-4 min-[1420px]:py-2 min-[1420px]:text-lg";

const navLinkActive =
  "min-[1420px]:rounded-[30px] min-[1420px]:border min-[1420px]:border-[#83105F] min-[1420px]:bg-[#83105F33] min-[1420px]:text-[#83105F]";

export function Menu({ isOpen, setIsOpen }: MenuProps) {
  const { t } = useTranslation();

  const closeMenu = () => setIsOpen(false);

  const getNavLinkClass = (desktopWidth: string, isActive: boolean) =>
    `${navLinkBase} ${navLinkMobile} ${navLinkDesktop} ${desktopWidth}
    ${isActive ? navLinkActive : ""}`;

  return (
    <div
      className={`${isOpen ? "flex" : "hidden"}
        z-90 w-full flex-col items-center justify-start bg-secondary px-4 pt-10 pb-[52px]

        sm:absolute sm:left-auto sm:right-5
        sm:-top-20 sm:h-auto sm:w-42
        sm:rounded-[14px] sm:bg-[#F3F2F3]
        sm:px-3 sm:py-3 sm:shadow-md

        min-[1420px]:hidden`}
      >
      <nav
        className="flex w-full flex-col items-center justify-center gap-6 text-center
          sm:gap-0
          min-[1420px]:pointer-events-auto min-[1420px]:-ml-50 min-[1420px]:flex-row min-[1420px]:justify-center min-[1420px]:gap-x-2 min-[1420px]:w-220"
      >
        <NavLink
          to="/about"
          onClick={closeMenu}
          className={({ isActive }) =>
            getNavLinkClass("min-[1420px]:w-30", isActive)
          }
        >
          {t("aboutUs")}
        </NavLink>

        <NavLink
          to="/specialists"
          onClick={closeMenu}
          className={({ isActive }) =>
            getNavLinkClass("min-[1420px]:w-54", isActive)
          }
        >
          {t("specialistsTitle")}
        </NavLink>

        <NavLink
          to="/events"
          onClick={closeMenu}
          className={({ isActive }) =>
            getNavLinkClass("min-[1420px]:w-30", isActive)
          }
        >
          {t("events")}
        </NavLink>

        <NavLink
          to="/materials"
          onClick={closeMenu}
          className={({ isActive }) =>
            getNavLinkClass("min-[1420px]:w-60", isActive)
          }
        >
          {t("materials")}
        </NavLink>

        <NavLink
          to="/contacts"
          onClick={closeMenu}
          className={({ isActive }) =>
            getNavLinkClass("min-[1420px]:w-36.25", isActive)
          }
        >
          {t("contacts")}
        </NavLink>
      </nav>

      <Link
        to="/"
        onClick={closeMenu}
        className="mt-3 mb-5 flex h-[57px] w-full max-w-[358px] cursor-pointer items-center justify-center rounded-[30px]
        border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8]
        text-center font-montserrat text-[18px] font-medium
        text-[sidebar] shadow-btn sm:hidden"
      >
        {t("support")}
      </Link>

      <div
        className="mt-4 w-full min-[1420px]:hidden
        sm:mt-3
        sm:flex
        sm:justify-center

        sm:[&_button]:h-7
        sm:[&_button]:w-full
        sm:[&_button]:rounded-[30px]
        sm:[&_button]:text-[11px]

        sm:[&_a]:h-7
        sm:[&_a]:w-full
        sm:[&_a]:rounded-[30px]
        sm:[&_a]:text-[11px]"
      >
        <LogIn variant="menu" />
      </div>
    </div>
  );
}
