import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language.slice(0, 2);
  const nextLanguage = currentLanguage === "ua" ? "en" : "ua";

  const changeLanguage = () => {
    i18n.changeLanguage(nextLanguage);
    localStorage.setItem("language", nextLanguage);
  };

  return (
    <button
      type="button"
      onClick={changeLanguage}
      className="text-base font-medium uppercase opacity-80 
      transition-opacity duration-200 hover:opacity-100 
      xl:-order-1 xl:z-51 xl:-mt-7"
    >
      {currentLanguage.toUpperCase()}
    </button>
  );
}