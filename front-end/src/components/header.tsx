import { User, Bell, ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";

/* Header */
function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="h-15 bg-[#2E6D9B] flex flex-row flex-nowrap gap-3 p-4 md:px-10 items-center justify-between fixed top-0 w-full">
      <div className="logo h-9 w-9 border border-white rounded">
        <img
          className="w-full h-full"
          src="public/logo.png"
          alt="Siwel Beats Logo"
        />
      </div>
      <nav
        className={`${!isOpen ? "hidden" : ""} bg-[#2E6D9B] text-white fixed top-15 left-0 right-0 md:static md:block`}
      >
        <ul className="flex flex-row flex-nowrap md:gap-8 text-md md:text-lg">
          <li className="inline cursor-pointer p-3 md:p-1 w-full hover:bg-[#1c567e] transition-colors duration-300">
            Home
          </li>
          <li className="cursor-pointer p-3 md:p-1 w-full hover:bg-[#1c567e] transition-colors duration-300">
            Service
          </li>
          <li className="cursor-pointer p-3 md:p-1 w-full hover:bg-[#1c567e] transition-colors duration-300">
            About
          </li>
          <li className="cursor-pointer p-3 md:p-1 w-full hover:bg-[#1c567e] transition-colors duration-300">
            Tracks
          </li>
          <li className="cursor-pointer p-3 md:p-1 w-full hover:bg-[#1c567e] transition-colors duration-300">
            Contact
          </li>
        </ul>
      </nav>
      <div className="user-icons text-white flex flex-row flex-nowrap gap-5 lg:gap-10">
        <span className="cursor-pointer p-1 rounded hover:bg-[#1c567e] transition-colors duration-300">
          <Bell size={25} />
        </span>
        <span className="cursor-pointer p-1 rounded hover:bg-[#1c567e] transition-colors duration-300">
          <ShoppingCart size={25} />
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
