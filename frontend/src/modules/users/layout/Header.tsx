import type React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { applyTheme, getInitialTheme } from "../../../utils/themeChange.util";
import { useAuth } from "../../../hooks/useAuth";
import { fetchXpBalance } from "@/store/slices/XPslice";
import XPDisplay from "./XPDisplay";
import type { AppDispatch, RootState } from "@/store/store";

const Header: React.FC = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); // To get user info
  const dispatch = useDispatch<AppDispatch>();
  const xpBalance = useSelector((state: RootState) => state.xp.xpBalance);
  const handleToggle = () => {
    setNavOpen(!navOpen);
  };

  // Dark/Light theme management
  const [theme, setTheme] = useState<string>(getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    // Fetch XP balance if authenticated
    if (token) {
      dispatch(fetchXpBalance());
    }

    // Add this interval to periodically refresh XP balance
    const refreshInterval = setInterval(() => {
      if (localStorage.getItem("token")) {
        dispatch(fetchXpBalance());
      }
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, [theme, dispatch]);

  const toggleTheme = (theme: string) => {
    setTheme(theme);
  };

  //  manually refresh XP
  const refreshXPBalance = () => {
    if (localStorage.getItem("token")) {
      dispatch(fetchXpBalance());
    }
  };

  // Update navLinks to include conditional dashboard link
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/games", label: "Games" },
    { to: "/bookings", label: "Bookings" },
    { to: "/memberships", label: "Memberships" },
    //{ to: "/about", label: "About" },
    { to: "/offers", label: "Offers" },
    { to: "/events", label: "Events" },
    // Add conditional dashboard link for managers and owners
    ...(user?.role === "manager" || user?.role === "owner"
      ? [{ to: "/admin", label: "Dashboard" }]
      : []),
  ];

  const renderNavLink = (to: string, label: string) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        isActive
          ? "py-0.5 md:py-3 px-4 md:px-1 md:text-xs border-s-2 md:border-s-0 md:border-b-2 border-primary font-normal text-gray-800 dark:text-white focus:outline-none"
          : "py-0.5 md:py-3 px-4 md:px-1 md:text-xs border-s-2 md:border-s-0 md:border-b-2 border-transparent text-gray-500 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white focus:outline-none"
      }
    >
      {label}
    </NavLink>
  );

  return (
    <header className="sticky top-0 inset-x-0 flex flex-wrap md:justify-start md:flex-nowrap z-50 w-full text-sm">
      <nav
        className="mt-4 relative max-w-4xl w-full bg-white/70 dark:bg-background-dark/80 text-gray-800 dark:text-gray-200 
  backdrop-blur-md border border-primary dark:border-primary rounded-[2rem] mx-2 py-2.5 md:flex md:items-center md:justify-between md:py-0 md:px-4 md:mx-auto"
      >
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

          {/* Dark/Light Theme Toggle */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className={`hs-dark-mode-active:hidden block hs-dark-mode font-medium text-gray-800 rounded-full hover:bg-gray-200 focus:outline-none focus:bg-gray-200 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800`}
              data-hs-theme-click-value="dark"
              onClick={() => toggleTheme("dark")}
              aria-label="Enable Dark Mode"
            >
              <span className="group inline-flex shrink-0 justify-center items-center size-9">
                <svg
                  className="shrink-0 size-4"
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
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                </svg>
              </span>
            </button>
            <button
              type="button"
              className={`hs-dark-mode-active:block hidden hs-dark-mode font-medium text-gray-800 rounded-full hover:bg-gray-200 focus:outline-none focus:bg-gray-200 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800`}
              data-hs-theme-click-value="light"
              onClick={() => toggleTheme("light")}
              aria-label="Enable Light Mode"
            >
              <span className="group inline-flex shrink-0 justify-center items-center size-9">
                <svg
                  className="shrink-0 size-4"
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
                  <circle cx="12" cy="12" r="4"></circle>
                  <path d="M12 2v2"></path>
                  <path d="M12 20v2"></path>
                  <path d="m4.93 4.93 1.41 1.41"></path>
                  <path d="m17.66 17.66 1.41 1.41"></path>
                  <path d="M2 12h2"></path>
                  <path d="M20 12h2"></path>
                  <path d="m6.34 17.66-1.41 1.41"></path>
                  <path d="m19.07 4.93-1.41 1.41"></path>
                </svg>
              </span>
            </button>
          </div>

          {/* Mobile Toggle Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="hs-collapse-toggle flex justify-center items-center size-6 border border-primary dark:border-gray-700 text-gray-500 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-200 dark:focus:bg-gray-700"
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
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
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

      {/* Authentication Buttons and XP Balance */}
      <div className="flex items-center justify-end mt-4 mx-4 space-x-2">
        {isAuthenticated && (
          <XPDisplay
            xpBalance={xpBalance}
            showTooltip={true}
            className="w-40"
          />
        )}
        {!isAuthenticated ? (
          <>
            <NavLink
              to="/auth"
              className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors duration-200"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </NavLink>
            <NavLink
              to="/auth"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors duration-200"
              onClick={() => {
                localStorage.setItem("isSignUp", "true");
                navigate("/auth");
              }}
            >
              Sign Up
            </NavLink>
          </>
        ) : (
          <NavLink
            to="/profile"
            className="flex items-center justify-center w-10 h-10 rounded-full border border-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors overflow-hidden"
            title="Profile"
          >
            {user?.googlePhotoUrl ? (
              <img
                src={user.googlePhotoUrl || "/placeholder.svg"}
                alt="profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="w-5 h-5 text-gray-700 dark:text-gray-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            )}
          </NavLink>
        )}
      </div>
    </header>
  );
};

export default Header;
