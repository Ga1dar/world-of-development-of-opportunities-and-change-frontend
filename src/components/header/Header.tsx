import { Link, NavLink } from "react-router-dom";
import "./Header.css";
import {  LogIn } from "../elements/enterpage/LogIn";

export function Header() {
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
            Про нас
          </NavLink>
          <NavLink
            to="/specialists"
            className={({ isActive }) => `navLink sm:w-52
            ${isActive ? "navLinkActive" : "navLink"}`}
          >
            Наші спеціалісти
          </NavLink>
          <NavLink
            to="/events"
            className={({ isActive }) => `navLink sm:w-20.25
            ${isActive ? "navLinkActive" : "navLink"}`}
          >
            Події
          </NavLink>
          <NavLink
            to="/contacts"
            className={({ isActive }) => `navLink sm:w-36.25
            ${isActive ? "navLinkActive" : "navLink"}`}
          >
            Контакти
          </NavLink>
        </nav>
        <LogIn />  
        <Link
          to="/"
          className="support sm:w-41.25"
        >
          Підтримка
        </Link>
      </menu>
    </header>
  );
}
