import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const Header: React.FC = () => {
  const [navOpen, setNavOpen] = useState(false);

  const handleToggle = () => {
    setNavOpen(!navOpen);
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/games", label: "Games" },
    { to: "/about", label: "About" },
  ];

  const renderNavLink = (to: string, label: string) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        isActive
          ? "py-0.5 md:py-3 px-4 md:px-1 border-s-2 md:border-s-0 md:border-b-2 border-primary font-normal text-gray-800 focus:outline-none"
          : "py-0.5 md:py-3 px-4 md:px-1 border-s-2 md:border-s-0 md:border-b-2 border-transparent text-gray-500 hover:text-gray-800 focus:outline-none"
      }
    >
      {label}
    </NavLink>
  );

  return (
    <header className="sticky top-0 inset-x-0 flex flex-wrap md:justify-start md:flex-nowrap z-50 w-full text-sm">
      <nav className="mt-4 relative max-w-4xl w-full bg-white/70 backdrop-blur-md border border-primary rounded-[2rem] mx-2 py-2.5 md:flex md:items-center md:justify-between md:py-0 md:px-4 md:mx-auto">
        <div className="px-4 md:px-0 flex justify-between items-center">
          {/* Logo */}
          <div>
            <NavLink
              to="/"
              className="flex-none rounded-md text-xl inline-block font-press focus:outline-none focus:opacity-80"
              aria-label="Preline"
            >
              <img src="/icon-main.svg" alt="Logo" className="w-8 h-auto" />
            </NavLink>
          </div>
          {/* End Logo */}

          {/* Mobile Toggle Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="hs-collapse-toggle flex justify-center items-center size-6 border border-primary text-gray-500 rounded-full hover:bg-gray-200 focus:outline-none focus:bg-gray-200"
              onClick={handleToggle}
              aria-expanded={navOpen}
              aria-label="Toggle navigation"
            >
              {!navOpen ? (
                <svg
                  className="hs-collapse-open:hidden shrink-0 size-3.5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" x2="21" y1="6" y2="6" />
                  <line x1="3" x2="21" y1="12" y2="12" />
                  <line x1="3" x2="21" y1="18" y2="18" />
                </svg>
              ) : (
                <svg
                  className="hs-collapse-open:block hidden shrink-0 size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div
          id="hs-navbar-header-floating"
          className={`${
            navOpen ? "block" : "hidden"
          } hs-collapse overflow-hidden transition-all duration-300 basis-full grow md:block`}
          aria-labelledby="hs-navbar-header-floating-collapse"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-2 md:gap-3 mt-3 md:mt-0 py-2 md:py-0 md:ps-7 font-press">
            {navLinks.map(({ to, label }) => renderNavLink(to, label))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
