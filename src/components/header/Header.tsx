import { Link, NavLink } from "react-router-dom";
import "./Header.css";
import { LogIn } from "../pages/LogIn";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { useState } from 'react';

export function Header() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="flex relative h-21.25 w-full pr-5 m-0  bg-[#4029401A] justify-end">
      <Link to="/">
        <img src="/Logo1.png" alt="Logo" className="h-34.5 w-34.5 absolute top-0 left-0" />
      </Link>
          <LogIn variant={"header"} />
          <LanguageSwitcher />
      <img 
        src="/Menu.png" 
        alt="Menu" 
        className="h-6 w-6 my-8 ml-5" 
        onClick={() => setIsOpen(prev => !prev)}
      >

      </img>
      <menu className={`${isOpen ? 'block' : 'hidden'}  absolute top-0 right-0
        w-fuul
        bg-white
        shadow-lg
        p-4
        z-50
      `}>
        <img
          src="/close.png" 
          alt="Menu" 
          onClick={() => setIsOpen(false)}
          className="absolute top-8 right-5 h-4 w-4 text-xl cursor-pointer"
        />
         
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
        <Link to="/" className="support sm:w-41.25">
          {t("support")}
        </Link>
      </menu>
    </header>
  );
}
