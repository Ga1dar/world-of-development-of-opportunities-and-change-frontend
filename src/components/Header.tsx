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
      className="relative flex h-21.25  
        w-full justify-end gap-5 xl:gap-3
      bg-[#4029401A] pr-5 mb-14 sm:mb-20 sm:h-24 xl:bg-secondary xl:h-52 xl:px-20">
      <Link to="/">
        <img
          src="/Logo1.png"
          alt="Logo"
          className="absolute left-0 top-0 h-34.5 w-34.5 sm:h-44 sm:w-44 xl:h-75 xl:w-79 xl:z-50 xl:-left-5"
          onClick={closeMenu}
        />
      </Link>

      {!isOpen && <LogIn variant="header" />}

      <Link
        to="/"
        onClick={closeMenu}
        className="hidden 
        sm:flex my-auto xl:mt-16 h-14 w-41 items-center rounded-[30px] 
        border-2 border-[#FEF85C] px-4 text-center 
        font-montserrat font-medium text-[18px] text-[sidebar] 
        shadow-btn bg-linear-to-b from-[#FFC700] via-[#FFD43B] to-[#FFF0A8] xl:z-51 xl:text-center"
      >
        {t("support")}
      </Link>

     
        <LanguageSwitcher />
      

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="my-auto flex h-6 w-6 sm:w-8 sm:h-8 cursor-pointer items-center justify-center xl:hidden"
      >
        <img
          src={isOpen ? "/close.png" : "/Menu.png"}
          alt="Menu"
          className="h-6 w-6 sm:h-8 sm:-8"
        />
      </button>
    </header>
  );
}