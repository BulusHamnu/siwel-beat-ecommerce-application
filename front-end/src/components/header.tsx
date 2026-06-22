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
  XIcon,
  RotateCwIcon,
  ArrowUpRight,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import formatTimeAgo from "../helpers/helpers";

type To =
  | string
  | {
      pathname?: string;
      search?: string;
    };

function LinkItem({
  text,
  to,
  type,
  setIsOpen,
}: {
  text: string;
  to: To;
  type?: string;
  setIsOpen: (value: boolean) => void;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const handleLiClick = () => {
    linkRef.current?.click();
  };

  return (
    <li
      onClick={() => handleLiClick()}
      className="cursor-pointer p-3 py-5 text-center max-md:text-lg md:p-1 w-full hover:bg-[#1c567e] transition-colors duration-300"
    >
      {type === "normal" ? (
        <a
          ref={linkRef}
          onClick={() => setIsOpen(false)}
          href={typeof to === "string" ? to : "#"}
        >
          {text}
        </a>
      ) : (
        <NavLink ref={linkRef} onClick={() => setIsOpen(false)} to={to}>
          {text}
        </NavLink>
      )}
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
  const handleLogout = () => logout();

  useEffect(() => {
    if (action === "logout") {
      const closeMenu = () => setIsOpen(false);

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
  }, [status, action, setIsOpen]);

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
        className={`${isAutheticated ? "" : "cursor-not-allowed"} p-3 hover:bg-[#4278B9] transition duration-300 whitespace-nowrap flex flex-row flex-nowrap gap-2.5`}
      >
        <LogOut size={25} />
        {isLoading && action === "logout" ? "Logging out.." : "Logout"}
      </li>
    </motion.ul>
  );
}

/* Notification Panel */
function NotificationPanel({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}) {
  // const { status, action, logout, isLoading, isAutheticated } = useAuth();
  const panelRef = useRef<HTMLDivElement | null>(null);

  interface Notification {
    id: string;
    type: string;
    message: string;
    read: boolean;
    resourceId: string;
    entityId: string;
    date: string | Date;
  }

  const [notifications] = useState<Notification[] | null>(null);

  useEffect(() => {
    const handleBodyClick = (e: any) => {
      if (panelRef.current && panelRef.current.contains(e.target)) {
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
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      id="notification-panel"
      className="bg-[rgba(2,21,38,1)] absolute border-2 border-white rounded-md p-1.5 h-fit w-[320px] min-[500px]:w-100  right-[-350%] min-[360px]:right-[-310%] top-[115%] min-[690px]:right-[50%] "
    >
      <div
        id="notification-panel-header"
        className="flex flex-row flex-nowrap justify-between items-center py-0.5 px-1.5 mt-1"
      >
        <h2 style={{ margin: 0 }} className="">
          Notifications
        </h2>
        <div className="flex flex-row flex-nowrap items-center gap-4">
          {notifications && notifications.length > 0 && (
            <button className="button-primary text-xs">Mark All As Read</button>
          )}
          <span className="cursor-pointer p-1 rounded hover:bg-[#1c567e] transition-colors duration-300">
            <RotateCwIcon size={25} />
          </span>
          <span
            onClick={() => setIsOpen(false)}
            className="cursor-pointer p-1 rounded hover:bg-[#1c567e] transition-colors duration-300"
          >
            <XIcon size={25} />
          </span>
        </div>
      </div>
      {notifications && notifications.length > 0 ? (
        <ul className="mt-5 max-h-112.5 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`${notification.read ? "bg-[rgba(6,43,88,0.3)]" : "bg-[rgba(6,43,88,0.6)]"} py-1.5 px-3 border border-gray-600 rounded mb-2`}
            >
              <div>
                <a
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(notification.type);
                  }}
                  href="#"
                  className="flex flex-row justify-between items-center hover:underline"
                >
                  <p
                    style={{ fontFamily: "Inter, sans-serif" }}
                    className="text-lg whitespace-break-spaces text-left"
                  >
                    {notification.message}
                  </p>
                  <ArrowUpRight size={20} />
                </a>
              </div>
              <div className="flex flex-row flex-nowrap justify-between items-center mt-3">
                <span className="text-sm">
                  {formatTimeAgo(notification.date)}
                </span>
                <div className="flex flex-row flex-nowrap gap-2">
                  <button
                    onClick={() => alert("Deleted!")}
                    className="cursor-pointer text-sm py-1 px-2 bg-blue-700 rounded hover:bg-blue-800 transition duration-300 w-22.5"
                  >
                    {notification.read ? "Mark Unread" : "Mark Read"}
                  </button>
                  <button
                    onClick={() => alert("Deleted!")}
                    className="cursor-pointer text-sm py-1 px-2 bg-red-700 rounded hover:bg-red-800 transition duration-300 w-22.5"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <span className="block p-4 text-lg">No Notification Found.</span>
      )}
    </motion.div>
  );
}

/* Header */
function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { isAutheticated } = useAuth();

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

  return (
    <>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          onClick={() => setIsOpen(false)}
          className={`fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.7)] z-40`}
        ></motion.div>
      ) : (
        ""
      )}
      <header
        className={`whitespace-nowrap h-15 bg-[#2E6D9B] flex flex-row flex-nowrap gap-3 p-4 md:px-6 lg:px-10 items-center justify-between fixed top-0 w-full`}
      >
        <div className="logo h-9 w-9 border border-white rounded">
          <img
            className="w-full h-full"
            src="logo.png"
            alt="Siwel Beats Logo"
          />
        </div>
        <nav
          className={`${isOpen ? "right-0 border-t border-b-white" : "-right-full"} bg-[#2E6D9B] text-white fixed top-15 max-md:h-full max-sm:w-[60vw] max-md:w-[40vw] md:w-fit md:static md:block transition-all duration-500 ease-in-out`}
        >
          <ul className="flex flex-col md:flex-row md:flex-nowrap md:gap-7 text-md md:text-lg text-left md:text-center">
            <LinkItem setIsOpen={setIsOpen} text="Home" to="/" />

            <LinkItem
              setIsOpen={setIsOpen}
              text="Services"
              to="#services"
              type="normal"
            />
            <LinkItem
              setIsOpen={setIsOpen}
              text="About"
              to="#about"
              type="normal"
            />

            <LinkItem setIsOpen={setIsOpen} text="Tracks" to="/tracks" />
            <LinkItem
              setIsOpen={setIsOpen}
              text="Contact"
              to="#contact"
              type="normal"
            />

            {!isAutheticated ? (
              <>
                <LinkItem
                  setIsOpen={setIsOpen}
                  text="Sign Up"
                  to={{ pathname: "/auth", search: "?action=signup" }}
                />
                <LinkItem
                  setIsOpen={setIsOpen}
                  text="Login"
                  to={{ pathname: "/auth", search: "?action=login" }}
                />
              </>
            ) : (
              ""
            )}
          </ul>
        </nav>
        <div className="user-icons text-white flex flex-row flex-nowrap gap-6 lg:gap-10">
          <Link
            to="/carts"
            className="cursor-pointer p-1 rounded hover:bg-[#1c567e] transition-colors duration-300"
          >
            <ShoppingCart size={25} />
          </Link>
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
              <ProfileMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
            )}
          </span>
          <span
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden cursor-pointer p-1 rounded hover:bg-[#1c567e] transition-colors duration-300"
          >
            {isOpen ? <X size={25} /> : <Menu size={25} />}
          </span>
        </div>
      </header>
    </>
  );
}

export default Header;
