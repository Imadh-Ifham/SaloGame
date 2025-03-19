import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
import { applyTheme, getInitialTheme } from "@/utils/themeChange.util";

interface User {
  role: string;
}

const Sidebar = ({ user }: { user: User }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  // Dark/Light theme management
  const [theme, setTheme] = useState<string>(getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = (theme: string) => {
    setTheme(theme);
  };

  const renderNavLink = (to: string, label: string, icon: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
          isActive
            ? "bg-primary text-white"
            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`
      }
    >
      <span className="mr-3">{icon}</span>
      {isExpanded && <span>{label}</span>}
    </NavLink>
  );
  return (
    <aside
      className={`${
        isExpanded ? "w-48 " : "w-20"
      } min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 shadow-lg transition-all duration-300`}
    >
      <div className="mb-4 flex justify-end">
        <button
          className="text-gray-700 dark:text-gray-200 text-xl focus:outline-none hover:text-primary transition-colors"
          onClick={toggleSidebar}
        >
          <FaBars />
        </button>
      </div>

      <div className="flex flex-col space-y-2">
        {renderNavLink("/admin/overview", "Overview", "📊")}
        {renderNavLink("/admin/Dashboard", "Users", "👤")}
        {renderNavLink("/admin/booking", "Bookings", "📝")}
        {renderNavLink("/admin/games", "Games", "🎮")}
        {renderNavLink("/admin/packages", "Packages", "📦")}
        {renderNavLink("/admin/offers", "Offers", "🎁")}
        {renderNavLink("/admin/memberships", "Memberships", "🌟")}
        {renderNavLink("/admin/events", "Events", "🎯")}

        {user?.role === "owner" &&
          renderNavLink("/admin/settings", "Settings", "⚙️")}
      </div>
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
    </aside>
  );
};

export default Sidebar;
