import { Link, NavLink } from "react-router-dom";
import { LogIn } from "./pages/LogIn";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

type HeaderProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function Header({ isOpen, setIsOpen }: HeaderProps) {
  const { t } = useTranslation();

  const closeMenu = () => setIsOpen(false);
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex h-[57px] items-center justify-center whitespace-nowrap rounded-[30px] 
    px-4 font-montserrat text-[18px] font-medium text-[#1C100E] min-[1420px]:h-8 
    min-[1420px]:px-3 min-[1420px]:text-[12px] 
  ${isActive ? "border border-[#83105F] bg-[#83105F33] text-[#83105F]" : ""}`;

  return (
    <header
      className={`relative z-80 flex h-21.25 w-full items-center justify-end gap-7
        bg-[#4029401A] pr-14.5 pl-0 sm:mb-20 sm:h-23.25 sm:gap-5 sm:px-5
        min-[1420px]:mt-0! min-[1420px]:mb-0! min-[1420px]:h-36.75!
         min-[1420px]:items-start min-[1420px]:gap-6 min-[1420px]:bg-secondary
          min-[1420px]:px-20 min-[1420px]:pt-8.75 min-[1900px]:h-38! min-[1900px]:pt-10 
          ${isOpen ? "mb-0" : "mb-14" }`}
      >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 hidden 
        bg-[#4029401A] min-[1420px]:top-8.75 min-[1420px]:block min-[1420px]:h-20 min-[1900px]:top-10"
      />

      <Link to="/">
        <img
          src="/Logo1.png"
          alt="Logo"
          className="absolute left-0 top-1 h-34.5 w-34.5 sm:h-44
           sm:w-44 min-[1420px]:left-20 min-[1420px]:top-0 min-[1420px]:z-120
            min-[1420px]:h-52.5! min-[1420px]:w-52.5! 
            min-[1900px]:top-10 min-[1900px]:h-71.75! min-[1900px]:w-69.25!"
          onClick={closeMenu}
        />
      </Link>

      <nav
        className="relative z-100 hidden flex-1 items-center 
        justify-center gap-2 min-[1420px]:mt-5.75
        min-[1420px]:flex min-[1420px]:pl-0 min-[1900px]:pl-37.5"
      >
        <NavLink to="/about" onClick={closeMenu} className={navLinkClass}>
          {t("aboutUs")}
        </NavLink>
        <NavLink to="/specialists" onClick={closeMenu} className={navLinkClass}>
          {t("specialistsTitle")}
        </NavLink>
        <NavLink to="/events" onClick={closeMenu} className={navLinkClass}>
          {t("events")}
        </NavLink>
        <NavLink to="/materials" onClick={closeMenu} className={navLinkClass}>
          {t("materials")}
        </NavLink>
        <NavLink to="/contacts" onClick={closeMenu} className={navLinkClass}>
          {t("contacts")}
        </NavLink>
      </nav>

      <div
        className="absolute top-4 left-44 
        z-100 sm:static min-[1420px]:order-2
        min-[1420px]:mt-5.75"
      >
        {!isOpen && <LogIn variant="header" />}
      </div>

      <Link
        to="/"
        onClick={closeMenu}
        className="relative z-100 hidden h-14.25 w-41 items-center rounded-[30px]
        border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8]
        px-4 text-center font-montserrat text-[18px] font-medium text-[sidebar]
        shadow-btn sm:flex sm:items-center sm:justify-center min-[1420px]:order-3 
        min-[1420px]:mt-5.75 min-[1420px]:h-8 min-[1420px]:w-28 min-[1420px]:text-[12px]"
      >
        {t("support")}
      </Link>

      <div
        className="absolute top-8.5 left-62.25 
        z-100 sm:static min-[1420px]:order-1
         min-[1420px]:mt-6.75 min-[1420px]:text-[12px]">
        <LanguageSwitcher />
      </div>
     

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="absolute top-7.5 left-76.5 
        z-100 flex h-6 w-6 cursor-pointer 
        items-center justify-center 
        sm:static sm:h-8 sm:w-8 min-[1420px]:hidden"
      >
        <img
          src={isOpen ? "/close.png" : "/Menu.png"}
          alt="Menu"
          className="h-6 w-6 sm:h-8 sm:w-8"
        />
      </button>
    </header>
  );
}
