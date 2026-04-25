import { Link } from "react-router-dom";
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

  return (
    <header
      className="relative z-80 mb-14 flex h-21.25 w-full justify-end gap-5
        bg-[#4029401A] pr-5 sm:mb-20 sm:h-24 xl:h-52 xl:gap-3 xl:bg-secondary xl:px-20"
      >
      <Link to="/">
        <img
          src="/Logo1.png"
          alt="Logo"
          className="absolute left-0 top-0 h-34.5 w-34.5 sm:h-44 sm:w-44 xl:-left-15 xl:z-120 xl:h-75 xl:w-79"
          onClick={closeMenu}
        />
      </Link>

      <div className="xl:relative z-100">
        {!isOpen && <LogIn variant="header" />}
      </div>

      <Link
        to="/"
        onClick={closeMenu}
        className="my-auto hidden h-14 w-41 items-center rounded-[30px]
        border-2 border-[#FEF85C] bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8]
        px-4 text-center font-montserrat text-[18px] font-medium text-[sidebar]
        shadow-btn sm:flex sm:items-center sm:justify-center xl:mt-16 xl:z-100 "
      >
        {t("support")}
      </Link>

      <div className="xl:flex xl:relative xl:z-100 xl:-order-1 xl:pointer-events-auto">
           <LanguageSwitcher />
       </div>
     

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="my-auto flex h-6 w-6 cursor-pointer items-center justify-center sm:h-8 sm:w-8 xl:hidden"
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