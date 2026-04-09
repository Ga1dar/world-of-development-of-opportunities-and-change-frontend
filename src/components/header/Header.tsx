import { Link, NavLink } from 'react-router-dom'
import './Header.css'

export function Header() {
  return (
    <header
      className='header'>
      <Link to="/">
        <img src='/Logo1.png'
        alt="Logo"
        className='logo' />
      </Link>
      <img
        src='/Menu.png'
        alt='Menu'
        className='menuImg'></img>
      <menu
        className='menu'>
        <nav
          className='nav'> 
          <NavLink
            to="/about"
            className={({ isActive }) => `navLink w-27.5
            ${isActive ? 'navLinkActive' : 'navLink'}`}>
            Про нас
          </NavLink>
          <NavLink
            to="/specialists" 
            className={({ isActive }) => `navLink w-52
            ${isActive ? 'navLinkActive' : 'navLink'}`}>
            Наші спеціалісти
          </NavLink>
          <NavLink
            to="/events" 
            className={({ isActive }) => `navLink w-20.25
            ${isActive ? 'navLinkActive' : 'navLink'}`}>
            Події
          </NavLink>
          <NavLink
            to="/contacts" 
            className={({ isActive }) => `navLink w-36.25
            ${isActive ? 'navLinkActive' : 'navLink'}`}>
            Контакти
          </NavLink>
        </nav>
        <button
          className='font-[Montserrat_Alternates] text-lg font-medium 
          text-center no-underline leading-[50px] w-[73px] h-[50px]'>
          Вхід
        </button>
        <Link
          to="/"
          className='font-[Montserrat_Alternates] text-lg font-medium 
        text-center no-underline leading-[50px] w-[165px] h-[50px]'>
          Підтримка
        </Link>
     </menu>
    </header>
  )
}