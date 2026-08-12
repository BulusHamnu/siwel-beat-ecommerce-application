import {
  User,
  Bell,
  ShoppingCart,
  Menu,
  X,
  Heart,
  LogOut,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import NotificationPanel from "./NotificationPanel";
import useActiveSection from "../hooks/useActiveSession";

type To =
  | string
  | {
      pathname?: string;
      search?: string;
    };

function LinkItem({
  text,
  to,
  sectionId,
  activeSection,
  setIsOpen,
}: {
  text: string;
  to: To;
  sectionId?: string;
  activeSection?: string;
  setIsOpen: (value: boolean) => void;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const handleLiClick = () => {
    linkRef.current?.click();
  };

  return (
    <li
      onClick={() => handleLiClick()}
      className={`cursor-pointer p-3 py-5 text-center max-md:text-lg min-[950px]:p-1 w-full hover:bg-[#1c567e] transition-colors duration-300`}
    >
      <NavLink
        className={`${activeSection && activeSection === sectionId ? "border-white border-b-2 font-bold" : ""}`}
        ref={linkRef}
        onClick={() => setIsOpen(false)}
        to={to}
      >
        {text}
      </NavLink>
    </li>
  );
}

/* Profile Menu */
function MenuItem({ to, children }: { to: To; children: any }) {
  return (
    <li className="profile-menu-item">
      <NavLink
        className="p-3 hover:bg-[#4278B9] transition duration-300 whitespace-nowrap flex flex-row flex-nowrap gap-2.5"
        to={to}
      >
        {children}
      </NavLink>
    </li>
  );
}

function ProfileMenu({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}) {
  const { status, action, logout, isLoading, isAutheticated } = useAuth();
  const menuRef = useRef<HTMLUListElement | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false); // Need this to prevent menu from showing toast and snap closing when auth status and action state never change from 'logout'.

  const handleLogout = () => {
    setLogoutLoading(true);
    logout();
  };

  useEffect(() => {
    if (action === "logout" && logoutLoading) {
      const closeMenu = () => {
        setIsOpen(false);
        setLogoutLoading(false);
      };

      if (status === "success") {
        toast.success("Logged out successfully.", {
          duration: 3000,
          id: "logout-successful",
          position: "top-center",
        });

        closeMenu();
      } else if (status === "failed") {
        toast.error("An error occurred while logging out.", {
          duration: 3000,
          id: "logout-failed",
          position: "top-center",
        });
      }
    }
  }, [status, action, setIsOpen, logoutLoading]);

  useEffect(() => {
    const handleBodyClick = (e: any) => {
      if (menuRef.current && menuRef.current.contains(e.target)) {
        return;
      }

      if (isOpen) setIsOpen(false);
    };

    document.body.addEventListener("click", handleBodyClick);

    return () => {
      document.body.removeEventListener("click", handleBodyClick);
    };
  }, [isOpen, setIsOpen]);

  return (
    <motion.ul
      ref={menuRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="profile-menu absolute h-fit w-60 border-2 border-white right-[50%] top-[115%] rounded-md bg-[#28415F] p-1.5"
    >
      <MenuItem to={"/profile"}>
        <User size={25} /> My Profile
      </MenuItem>

      <MenuItem to={"/orders"}>
        <CreditCard size={25} /> My Orders
      </MenuItem>

      <MenuItem to={"/favourites"}>
        <Heart size={25} /> Favourites
      </MenuItem>

      <MenuItem to={"/purchases"}>
        <ShoppingBag size={25} /> Purchases
      </MenuItem>

      <li
        onClick={isAutheticated ? handleLogout : undefined}
        className={`${isAutheticated ? "cursor-pointer" : "cursor-not-allowed"} p-3 hover:bg-[#4278B9] transition duration-300 whitespace-nowrap flex flex-row flex-nowrap gap-2.5`}
      >
        <LogOut size={25} />
        {isLoading && action === "logout" ? "Logging out.." : "Logout"}
      </li>
    </motion.ul>
  );
}

/* Header */
function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { isAutheticated, data: user, isLoading, action } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const sectionId = location.hash.replace("#", "");
    if (sectionId) {
      const section = document.getElementById(sectionId);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const activeSection = useActiveSection([
    "hero",
    "licences",
    "services",
    "about",
    "contact",
    "tracks",
  ]);

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          onClick={() => setIsOpen(false)}
          className={`fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.7)] z-40`}
        ></motion.div>
      )}
      <motion.header
        className={`whitespace-nowrap h-15 bg-[#2E6D9B] flex flex-row flex-nowrap gap-3 p-2 md:px-6 lg:px-10 items-center justify-between fixed top-0 w-full`}
      >
        {/* Logo */}
        <div className="logo h-9 w-9 border border-white rounded">
          <img
            className="w-full h-full"
            src="logo.png"
            alt="Siwel Beats Logo"
          />
        </div>

        {/* NavBar */}
        <motion.nav
          className={`${isOpen ? "right-0 border-t border-b-white" : "-right-full"} bg-[#2E6D9B] text-white fixed top-15 transition-all duration-500 ease-in-out h-full min-[950px]:static max-md:w-[60vw] max-[950px]:w-[40vw]`}
        >
          <ul className="flex flex-col min-[950px]:flex-row flex-nowrap items-center justify-center md:gap-7 text-md min-[950px]:text-lg text-left max-[950px]:text-center">
            <LinkItem
              sectionId="hero"
              activeSection={activeSection}
              setIsOpen={setIsOpen}
              text="Home"
              to="/#hero"
            />

            <LinkItem
              sectionId="licences"
              activeSection={activeSection}
              setIsOpen={setIsOpen}
              text="Licensing"
              to="/#licences"
            />

            <LinkItem
              sectionId="services"
              activeSection={activeSection}
              setIsOpen={setIsOpen}
              text="Services"
              to="/#services"
            />

            <LinkItem
              sectionId="about"
              activeSection={activeSection}
              setIsOpen={setIsOpen}
              text="About"
              to="/#about"
            />

            <LinkItem
              sectionId="contact"
              activeSection={activeSection}
              setIsOpen={setIsOpen}
              text="Contact"
              to="/#contact"
            />

            <LinkItem
              sectionId="tracks"
              activeSection={activeSection}
              setIsOpen={setIsOpen}
              text="Tracks"
              to="/tracks"
            />

            {!isAutheticated && (
              <>
                <LinkItem
                  setIsOpen={setIsOpen}
                  text="Sign Up"
                  to={{ pathname: "/auth/signup" }}
                />
                <LinkItem
                  setIsOpen={setIsOpen}
                  text="Login"
                  to={{ pathname: "/auth/login" }}
                />
              </>
            )}
          </ul>
        </motion.nav>

        {/* Action Icons */}
        {isLoading && action !== "logout" ? (
          <div className="h-10 w-37.5 rounded bg-[#4f79b8]/55 animate-pulse" />
        ) : (
          <div className="user-icons text-white flex flex-row flex-nowrap gap-6 lg:gap-10">
            {isAutheticated && user?.role === "admin" ? (
              <motion.button
                onClick={() => alert("hii")}
                className="text-white button-primary text-sm md:text-md"
              >
                Admin Dashboard
              </motion.button>
            ) : (
              <>
                {/* Cart Icon */}
                <NavLink
                  to="/cart"
                  className="cursor-pointer p-1 rounded hover:bg-[#1c567e] transition-colors duration-300"
                >
                  <ShoppingCart size={25} />
                </NavLink>
                {/* Notification Icon */}
                <span className="p-1 rounded hover:bg-[#1c567e] transition-colors duration-300 relative z-50">
                  <Bell
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsNotificationOpen(!isNotificationOpen);
                    }}
                    size={25}
                  />
                  {isNotificationOpen && (
                    <NotificationPanel
                      isOpen={isNotificationOpen}
                      setIsOpen={setIsNotificationOpen}
                    />
                  )}
                </span>
                {/* Profile Icon */}
                <span className="p-1 rounded hover:bg-[#1c567e] transition-colors duration-300 relative z-50">
                  <User
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(!isMenuOpen);
                    }}
                    size={25}
                  />
                  {isMenuOpen && (
                    <ProfileMenu
                      isOpen={isMenuOpen}
                      setIsOpen={setIsMenuOpen}
                    />
                  )}
                </span>
              </>
            )}

            <span
              onClick={() => setIsOpen(!isOpen)}
              className="min-[950px]:hidden cursor-pointer p-1 rounded hover:bg-[#1c567e] transition-colors duration-300 grid items-center"
            >
              {isOpen ? <X size={25} /> : <Menu size={25} />}
            </span>
          </div>
        )}
      </motion.header>
    </>
  );
}

export default Header;
