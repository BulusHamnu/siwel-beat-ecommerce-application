import SocialLinks from "./socialLinks";
import useNewsletter from "../hooks/subscribeNewsletter";
import toast from "react-hot-toast";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { onViewVariants } from "../config/animation";

/* Footer */
function Footer() {
  const { subscribeUser, status, errCode, isLoading } = useNewsletter();
  const formRef = useRef<HTMLFormElement | null>(null);

  async function handleSubscribe(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.target);
    await subscribeUser(data.get("email") as string);
  }

  useEffect(() => {
    if (status === "success") {
      toast.success("Thanks gang! You're on the list.", {
        duration: 3000,
        id: "subscription-success",
        position: "bottom-right",
      });

      formRef.current?.reset();
      //
    } else if (status === "failed") {
      switch (errCode) {
        case "VALIDATION_ERROR": {
          toast.error("Please enter a valid email address.", {
            duration: 3000,
            id: "validation-error",
            position: "bottom-right",
          });
          break;
        }

        case "RATE_LIMIT_EXCEEDED": {
          toast.error("Too many attempts. Please try again in a few minutes.", {
            duration: 3000,
            id: "too-many-request",
            position: "bottom-right",
          });
          break;
        }

        case "EMAIL_ALREADY_SUBSCRIBED": {
          toast.error(
            "This email is already on our list. Thanks for your support!",
            {
              duration: 3000,
              id: "too-many-request",
              position: "bottom-right",
            },
          );
          break;
        }

        default: {
          toast.error("Something went wrong. Please try again in a moment.", {
            duration: 3000,
            id: "subscription-failed",
            position: "bottom-right",
          });
        }
      }
    }
  }, [status, errCode]);

  return (
    <motion.footer
      variants={onViewVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="bg-[#2E6D9B] p-6 lg:px-14 grid grid-cols-1 md:grid-cols-2 gap-4 "
    >
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
          ref={formRef}
          onSubmit={(e) => handleSubscribe(e)}
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
            disabled={isLoading}
            className={`cursor-pointer disabled:cursor-not-allowed button-primary w-full h-12 text-xl my-3 text-white md:w-37.5`}
            type="submit"
          >
            {isLoading ? "Subscribing.." : "Subscribe"}
          </button>
        </form>
      </div>
    </motion.footer>
  );
}

export default Footer;
