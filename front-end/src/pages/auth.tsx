import { motion } from "motion/react";
import { useState } from "react";
import { User2, Mail, LockKeyhole } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

function TabBtn({
  placeholder,
  style,
  tab,
  setActiveTab,
}: {
  placeholder: string;
  style: string;
  tab: string;
  setActiveTab: (value: string) => void;
}) {
  return (
    <motion.button
      whileHover={{
        opacity: 0.8,
        transition: { duration: 0.3 },
      }}
      transition={{ duration: 0.5 }}
      className={`${style} cursor-pointer p-2 max-w-full rounded-md`}
      onClick={() => setActiveTab(tab)}
    >
      {placeholder}
    </motion.button>
  );
}

function SignupPanel() {
  return (
    <div className="pb-5">
      <form
        id="signup-panel"
        className="mt-5 flex flex-nowrap flex-col gap-6 justify-center"
      >
        <div className="row-group flex flex-col flex-nowrap gap-5 md:flex-row ">
          <div className="flex flex-col flex-nowrap gap-3 justify-center items-left w-full">
            <label
              htmlFor="firstname"
              className="flex flex-row flex-nowrap gap-4 items-center"
            >
              <User2 /> First Name
            </label>
            <input
              required
              id="firstname"
              name="firstname"
              type="text"
              placeholder="Your First Name.."
              className="rounded-sm h-12"
            />
          </div>
          <div className="flex flex-col flex-nowrap gap-3 justify-center items-left w-full">
            <label
              htmlFor="lastname"
              className="flex flex-row flex-nowrap gap-4 items-center"
            >
              <User2 /> Last Name
            </label>
            <input
              required
              id="lastname"
              name="lastname"
              type="text"
              placeholder="Your Last Name.."
              className="rounded-sm h-12"
            />
          </div>
        </div>
        <div className="row-group flex flex-col flex-nowrap gap-5 md:flex-row ">
          <div className="flex flex-col flex-nowrap gap-3 justify-center w-full">
            <label
              htmlFor="firstname"
              className="flex flex-row flex-nowrap gap-4 items-center"
            >
              <Mail /> Email
            </label>
            <input
              required
              id="email"
              name="email"
              type="email"
              placeholder="Your Email.."
              className="rounded-sm h-12"
            />
          </div>
        </div>
        <div className="row-group flex flex-col flex-nowrap gap-5 md:flex-row ">
          <div className="flex flex-col flex-nowrap gap-3 justify-center w-full">
            <label
              htmlFor="password"
              className="flex flex-row flex-nowrap gap-4 items-center"
            >
              <LockKeyhole /> Password
            </label>
            <input
              required
              id="password"
              name="password"
              type="password"
              placeholder="Password.."
              className="rounded-sm h-12"
            />
          </div>
        </div>
        <div className="row-group flex flex-col flex-nowrap gap-5 md:flex-row ">
          <div className="flex flex-col flex-nowrap gap-3 justify-center w-full">
            <label
              htmlFor="confirm-password"
              className="flex flex-row flex-nowrap gap-4 items-center"
            >
              <LockKeyhole /> Confirm Password
            </label>
            <input
              required
              id="confirm-password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter Password.."
              className="rounded-sm h-12"
            />
          </div>
        </div>
        <button type="submit" className="button-primary text-xl w-full h-14">
          Sign Up
        </button>
      </form>
      <button className="mt-4 button-primary text-xl w-full h-14 flex flex-row flex-nowrap gap-2 items-center justify-center">
        <FcGoogle size={26} /> Sign Up With Google
      </button>
    </div>
  );
}

function LoginPanel() {
  return <form id="login-panel">Login</form>;
}

/* Auth page */
function Auth() {
  const [activeTab, setActiveTab] = useState("signup");

  return (
    <main style={{ paddingTop: "20px" }} className="text-white p-2.5">
      <h1>Hii, welcome to my website!</h1>
      <div className="bg-[rgba(46,109,155,0.5)] max-w-175 mx-auto rounded-md px-2 py-4 md:p-4">
        <div className="bg-[rgba(2,21,38,0.7)] max-w-175 mx-auto rounded-md grid grid-cols-2 items-center gap-2 p-1.5">
          <TabBtn
            tab="signup"
            setActiveTab={setActiveTab}
            placeholder="Sign Up"
            style={`${activeTab === "signup" ? "bg-[rgba(46,109,155,0.7)]" : ""}`}
          />
          <TabBtn
            tab="login"
            setActiveTab={setActiveTab}
            placeholder="Login"
            style={`${activeTab === "login" ? "bg-[rgba(46,109,155,0.7)]" : ""}`}
          />
        </div>
        {activeTab === "signup" ? <SignupPanel /> : <LoginPanel />}
      </div>
    </main>
  );
}

export default Auth;
