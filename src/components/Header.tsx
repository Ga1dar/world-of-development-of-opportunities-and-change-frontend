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
    `flex h-[57px] items-center justify-center whitespace-nowrap rounded-[30px] px-4 font-montserrat text-[18px] font-medium text-[#1C100E] ${
      isActive ? "border border-[#83105F] bg-[#83105F33] text-[#83105F]" : ""
    }`;

  return (
    <header
      className={`relative z-80 flex h-[85px] w-full items-center justify-end gap-7
        bg-[#4029401A] pr-[58px] pl-0 sm:mb-20 sm:h-[93px] sm:gap-5 sm:px-5
        min-[1420px]:mt-0 min-[1420px]:mb-0 min-[1420px]:h-28 min-[1420px]:gap-6 min-[1420px]:px-20 ${
          isOpen ? "mb-0" : "mb-14"
        }`}
      >
      <Link to="/">
        <img
          src="/Logo1.png"
          alt="Logo"
          className="absolute left-0 top-1 h-[138px] w-[138px] sm:h-44 sm:w-44 min-[1420px]:left-[80px] min-[1420px]:top-[-1px] min-[1420px]:z-120 min-[1420px]:!h-[287px] min-[1420px]:!w-[277px]"
          onClick={closeMenu}
        />
      </Link>

      <nav className="relative z-100 hidden flex-1 items-center justify-center gap-2 pl-[190px] min-[1420px]:flex">
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

      <div className="absolute top-4 left-[176px] z-100 sm:static min-[1420px]:order-2">
        {!isOpen && <LogIn variant="header" />}
      </div>

      <Link
        to="/"
        onClick={closeMenu}
        className="relative z-100 hidden h-[57px] w-[164px] items-center rounded-[30px]
        border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8]
        px-4 text-center font-montserrat text-[18px] font-medium text-[sidebar]
        shadow-btn sm:flex sm:items-center sm:justify-center min-[1420px]:order-3"
      >
        {t("support")}
      </Link>

      <div className="absolute top-[34px] left-[249px] z-100 sm:static min-[1420px]:order-1">
        <LanguageSwitcher />
      </div>
     

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="absolute top-[30px] left-[306px] z-100 flex h-6 w-6 cursor-pointer items-center justify-center sm:static sm:h-8 sm:w-8 min-[1420px]:hidden"
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
