import { Link, NavLink } from "react-router-dom";
import "./Header.css";
import { LogIn } from "../pages/LogIn";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../LanguageSwitcher";

export function Header() {
  const { t } = useTranslation();
  return (
    <header className="header">
      <Link to="/">
        <img src="/Logo1.png" alt="Logo" className="logo" />
      </Link>
      <img src="/Menu.png" alt="Menu" className="menuImg"></img>
      <menu className="menu">
        <nav className="nav">
          <NavLink
            to="/about"
            className={({ isActive }) => `navLink sm:w-27.5
            ${isActive ? "navLinkActive" : "navLink"}`}
          >
            {t("aboutUs")}
          </NavLink>
          <NavLink
            to="/specialists"
            className={({ isActive }) => `navLink sm:w-52
            ${isActive ? "navLinkActive" : "navLink"}`}
          >
            {t("specialistsTitle")}
          </NavLink>
          <NavLink
            to="/events"
            className={({ isActive }) => `navLink sm:w-20.25
            ${isActive ? "navLinkActive" : "navLink"}`}
          >
            {t("events")}
          </NavLink>
          <NavLink
            to="/materials"
            className={({ isActive }) => `navLink 
            ${isActive ? "navLinkActive" : "navLink"}`}
          >
            {t("materials")}
          </NavLink>
          <NavLink
            to="/contacts"
            className={({ isActive }) => `navLink sm:w-36.25
            ${isActive ? "navLinkActive" : "navLink"}`}
          >
            {t("contacts")}
          </NavLink>
        </nav>
        <LanguageSwitcher />
        <LogIn variant={"header"} />
        <Link to="/" className="support sm:w-41.25">
          {t("support")}
        </Link>
      </menu>
    </header>
  );
}
