import { User, Bell, ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

type To =
  | string
  | {
      pathname?: string;
      search?: string;
    };

function LinkItem({ text, to }: { text: string; to: To }) {
  return (
    <li className="cursor-pointer p-3 max-md:pl-7 md:p-1 w-full hover:bg-[#1c567e] transition-colors duration-300">
      <Link to={to}>{text}</Link>
    </li>
  );
}

/* Header */
function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAutheticated] = useState(false);

  return (
    <header
      className={`whitespace-nowrap h-15 bg-[#2E6D9B] flex flex-row flex-nowrap gap-3 p-4 md:px-6 lg:px-10 items-center justify-between fixed top-0 w-full`}
    >
      <div className="logo h-9 w-9 border border-white rounded">
        <img className="w-full h-full" src="logo.png" alt="Siwel Beats Logo" />
      </div>
      <nav
        className={`${isOpen ? "right-0 border-t border-b-white" : "-right-full"} bg-[#2E6D9B] text-white fixed top-15 max-md:h-full max-sm:w-[60vw] max-md:w-[40vw] md:w-fit md:static md:block transition-all duration-500 ease-in-out`}
      >
        <ul className="flex flex-col md:flex-row md:flex-nowrap md:gap-7 text-md md:text-lg text-left md:text-center">
          <LinkItem text="Home" to="/" />
          <LinkItem text="Service" to="/#service" />
          <LinkItem text="About" to="/#about" />
          <LinkItem text="Tracks" to="/#tracks" />
          <LinkItem text="Contact" to="/#contact" />
          {!isAutheticated ? (
            <>
              <LinkItem
                text="Sign Up"
                to={{ pathname: "/auth", search: "?action=signup" }}
              />
              <LinkItem
                text="Login"
                to={{ pathname: "/auth", search: "?action=login" }}
              />
            </>
          ) : (
            ""
          )}
        </ul>
      </nav>
      <div className="user-icons text-white flex flex-row flex-nowrap gap-4 lg:gap-10">
        <Link
          to="/carts"
          className="cursor-pointer p-1 rounded hover:bg-[#1c567e] transition-colors duration-300"
        >
          <ShoppingCart size={25} />
        </Link>
        <span className="cursor-pointer p-1 rounded hover:bg-[#1c567e] transition-colors duration-300">
          <Bell size={25} />
        </span>
        <span className="cursor-pointer p-1 rounded hover:bg-[#1c567e] transition-colors duration-300">
          <User size={25} />
        </span>
        <span
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden cursor-pointer p-1 rounded hover:bg-[#1c567e] transition-colors duration-300"
        >
          {isOpen ? <X size={25} /> : <Menu size={25} />}
        </span>
      </div>
    </header>
  );
}

export default Header;
