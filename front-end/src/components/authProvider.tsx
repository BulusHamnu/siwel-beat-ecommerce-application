import { useState, useEffect } from "react";
import authContext from "../hooks/contexts/authContext";
import callApi from "../lib/callApi";

interface UserSnapshot {
  id: string;
  email: string;
  isVerified: boolean;
  role: "user" | "admin";
  isActive: boolean;
}

interface UserProfile extends UserSnapshot {
  username: string;
  email: string;
  avatar: string;
  notification: {
    emailNotification: {
      commentAndLikes: boolean;
      orders: boolean;
    };
  };
  firstName: string;
  lastName: string;
  gender: string;
  bio: string;
  createdAt: Date | string;
}

export default function AuthContextProvider({ children }) {
  const [data, setData] = useState<
    UserSnapshot | UserProfile | undefined | null
  >(null);
  const [isAutheticated, setIsAutheticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errCode, setErrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [action, setAction] = useState<
    "verification" | "login" | "logout" | null
  >(null);

  const executeApiCall = async <T,>(
    method: "get" | "post",
    endpoint: string,
    body?: any,
  ) => {
    try {
      setIsLoading(true);
      setData(null);
      setErrCode(null);
      setStatus("idle");

      const res = await callApi<T>({
        endpoint,
        method,
        body,
        withAuth: true,
      });

      setStatus("success");
      return res.data;
      //
    } catch (error: any) {
      setErrCode(error.response.data?.error.code);
      setStatus("failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return;
      }

      setIsAutheticated(false);
      setAction("verification"); // So we can verify if it's logging, logout or token verification.

      let profile: any;
      profile = await executeApiCall<UserProfile>("get", "/users/me");

      if (!profile) {
        const data = await executeApiCall<{ accessToken: string }>(
          "post",
          "/auth/refresh-token",
        );

        localStorage.setItem("accessToken", data?.accessToken || "");
        profile = await executeApiCall<UserProfile>("get", "/users/me");
      }

      if (profile) {
        setIsAutheticated(true);
        setData(profile);
      }
    };

    verifyToken();
  }, []);

  const login = async (body: { email: string; password: string }) => {
    setAction("login");
    setIsAutheticated(false);

    const data = await executeApiCall<{
      user: UserSnapshot;
      accessToken: string;
    }>("post", "/auth/login", body);

    setData(data?.user);
    setIsAutheticated(true);

    localStorage.setItem("accessToken", data?.accessToken || "");
  };

  const logout = async () => {
    setAction("logout");

    await executeApiCall<null>("post", "/auth/log-out");

    setData(null);
    setIsAutheticated(false);
    localStorage.setItem("accessToken", "");
  };

  const value = {
    data,
    login,
    logout,
    isAutheticated,
    isLoading,
    errCode,
    status,
    action,
    resetAuthAction: () => setAction(null),
  };

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
}
