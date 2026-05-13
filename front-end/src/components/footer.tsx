import SocialLinks from "./socialLinks";

/* Footer */
function Footer() {
  return (
    <footer className="bg-[#2E6D9B] p-6 lg:px-14 grid grid-cols-1 md:grid-cols-2 gap-4 ">
      <div className="flex flex-col flex-nowrap gap-3 items-center md:items-start">
        <p style={{ fontSize: "1.5rem" }} className="md:text-left">
          Follow My Social
        </p>
        <SocialLinks />
      </div>
      <div className="flex flex-col flex-nowrap gap-3 md:gap-1 items-center md:items-start w-full">
        <p style={{ fontSize: "1.5rem" }} className="md:text-left">
          Subscribe To My Newsletter
        </p>
        <form
          action="POST"
          className="w-full flex flex-col flex-nowrap md:flex-row items-center gap-1"
        >
          <input
            required
            className="bg-white text-black p-2 h-12 w-full"
            type="email"
            id="newsletter-email"
            placeholder="Your Email.."
            name="email"
          />
          <button
            className="button-primary w-full h-12 text-xl my-3 text-white md:w-37.5"
            type="submit"
          >
            Subscribe
          </button>
        </form>
      </div>
    </footer>
  );
}

export default Footer;
