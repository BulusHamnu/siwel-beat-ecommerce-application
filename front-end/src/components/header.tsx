import { User, Bell, ShoppingCart, Menu, X } from "lucide-react";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";

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
        <Link ref={linkRef} onClick={() => setIsOpen(false)} to={to}>
          {text}
        </Link>
      )}
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
