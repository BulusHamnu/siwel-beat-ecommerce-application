import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { User2, Mail, LockKeyhole, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Link, useSearchParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import callApi from "../lib/callApi";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const signupMutation = useMutation({
    mutationFn: async (data) => {
      const res = await callApi<null>({
        endpoint: "/auth/register",
        method: "post",
        body: data,
      });

      return res.data;
    },
    onSuccess: () => {
      toast.success("User created successfully! You can log in now, gang.", {
        duration: 3000,
        id: "user-created",
        position: "top-center",
      });

      formRef.current?.reset();
    },
    onError: (error: any) => {
      const errCode: string = error.response.data.error.code;
      switch (errCode) {
        case "VALIDATION_ERROR": {
          toast.error(
            "Hey, please fill out the form and make sure all fields are valid.",
            {
              duration: 3000,
              id: "validation-error",
              position: "top-center",
            },
          );
          break;
        }

        case "USER_ALREADY_EXISTS": {
          toast.error("User already exists. Please log in instead.", {
            duration: 3000,
            id: "user-exists",
            position: "top-center",
          });
          break;
        }

        case "RATE_LIMIT_EXCEEDED": {
          toast.error("Too many attempts. Please try again in a few minutes.", {
            duration: 3000,
            id: "too-many-request",
            position: "top-center",
          });
          break;
        }

        default: {
          toast.error("Something went wrong. Please try again in a moment.", {
            duration: 3000,
            id: "message-failed",
            position: "top-center",
          });
          break;
        }
      }
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="pb-5 px-2 md:px-3"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();

          const formData = new FormData(e.currentTarget);
          const data: any = {};
          formData.forEach((value, key) => {
            data[key] = value;
          });

          signupMutation.mutate(data);
        }}
        ref={formRef}
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
              name="firstName"
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
              name="lastName"
              type="text"
              placeholder="Your Last Name.."
              className="rounded-sm h-12"
            />
          </div>
        </div>
        <div className="row-group flex flex-col flex-nowrap gap-5 md:flex-row ">
          <div className="flex flex-col flex-nowrap gap-3 justify-center w-full">
            <label
              htmlFor="username"
              className="flex flex-row flex-nowrap gap-4 items-center"
            >
              <User2 /> Username
            </label>
            <input
              required
              id="username"
              name="username"
              type="text"
              placeholder="Your Username.."
              className="rounded-sm h-12"
            />
          </div>
        </div>
        <div className="row-group flex flex-col flex-nowrap gap-5 md:flex-row ">
          <div className="flex flex-col flex-nowrap gap-3 justify-center w-full">
            <label
              htmlFor="email"
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
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                required
                id="password"
                name="password"
                placeholder="Password.."
                className="rounded-sm h-12 pr-10 w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff color="black" size={20} />
                ) : (
                  <Eye color="black" size={20} />
                )}
              </button>
            </div>
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
            <div className="relative w-full">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                id="confirm-password"
                name="confirmPassword"
                placeholder="Confirm password.."
                className="rounded-sm h-12 pr-10 w-full"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff color="black" size={20} />
                ) : (
                  <Eye color="black" size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
        <button
          disabled={signupMutation.isPending}
          type="submit"
          className="button-primary text-xl w-full h-14"
        >
          {signupMutation.isPending ? "Signing up.." : "Sign Up"}
        </button>
      </form>
      <button className="mt-4 button-primary text-xl w-full h-14 flex flex-row flex-nowrap gap-2 items-center justify-center">
        <FcGoogle size={26} /> Sign Up With Google
      </button>
    </motion.div>
  );
}

function LoginPanel() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, errCode, status, action } = useAuth();
  const formRef = useRef<HTMLFormElement | null>(null);
  const navigate = useNavigate();

  async function handleLoginSubmision(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = new FormData(e.target);

    await login({
      email: data.get("email"),
      password: data.get("password"),
    });
  }

  useEffect(() => {
    if (status === "success" && action === "login") {
      toast.success("You're in, gang! Welcome back.", {
        duration: 3000,
        id: "login-succesfully",
        position: "top-center",
      });

      formRef.current?.reset();
      navigate("/");
      //
    } else if (status === "failed" && action === "login") {
      switch (errCode) {
        case "INCORRECT_PASSWORD": {
          toast.error("Hmm, that password doesn't match. Want to try again?", {
            duration: 3000,
            id: "incorrect-password",
            position: "top-center",
          });
          break;
        }

        case "USER_NOT_FOUND": {
          toast.error("Invalid email or password. Please try again.", {
            duration: 3000,
            id: "user-not-found",
            position: "top-center",
          });
          break;
        }

        case "RATE_LIMIT_EXCEEDED": {
          toast.error("Too many attempts. Please try again in a few minutes.", {
            duration: 3000,
            id: "too-many-request",
            position: "top-center",
          });
          break;
        }

        default: {
          toast.error("Something went wrong. Please try again in a moment.", {
            duration: 3000,
            id: "login-failed",
            position: "top-center",
          });
          break;
        }
      }
    }
  }, [errCode, status, action, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="pb-5 px-2 md:px-3"
    >
      <form
        ref={formRef}
        onSubmit={async (e) => {
          await handleLoginSubmision(e);
        }}
        id="login-panel"
        className="mt-5 flex flex-nowrap flex-col gap-6 justify-center"
      >
        <div className="row-group flex flex-col flex-nowrap gap-5 md:flex-row ">
          <div className="flex flex-col flex-nowrap gap-3 justify-center w-full">
            <label
              htmlFor="email"
              className="flex flex-row flex-nowrap gap-4 items-center"
            >
              <Mail /> Email
            </label>
            <input
              required
              id="email"
              name="email"
              type="email"
              placeholder="Email.."
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

            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                required
                id="password"
                name="password"
                placeholder="Password.."
                className="rounded-sm h-12 pr-10 w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff color="black" size={20} />
                ) : (
                  <Eye color="black" size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
        <button
          disabled={isLoading && action === "login"}
          type="submit"
          className="button-primary text-xl w-full h-14"
        >
          {isLoading && action === "login" ? "Logging.." : "Login"}
        </button>
      </form>
      <button
        disabled
        className="mt-4 button-primary text-xl w-full h-14 flex flex-row flex-nowrap gap-2 items-center justify-center"
      >
        <FcGoogle size={26} /> Login With Google
      </button>
      <span className="text-right mt-5 block">
        <p className="whitespace-nowrap">
          Forgotten your password?
          <Link className="text-blue-500 underline" to="/auth/forgot-password">
            Reset it here.
          </Link>
        </p>
      </span>
    </motion.div>
  );
}

/* Auth page */
function Auth() {
  const [searchParams] = useSearchParams();
  const action = searchParams.get("action");

  const [activeTab, setActiveTab] = useState(() => {
    return action === "login" ? "login" : "signup";
  });

  return (
    <main style={{ paddingTop: "20px" }} className="text-white p-2.5">
      {activeTab === "signup" ? (
        <h1>Hii, welcome to my website!</h1>
      ) : (
        <h1>Welcome back dawg!</h1>
      )}

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
        <div className="p-1">
          {activeTab === "signup" ? <SignupPanel /> : <LoginPanel />}
        </div>
      </div>
    </main>
  );
}

export default Auth;
