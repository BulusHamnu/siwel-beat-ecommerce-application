import callApi from "../lib/callApi";
import { useState } from "react";

function useNewsletter() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("idle");
  const [errCode, setErrCode] = useState<string | undefined>(undefined);

  const subscribeUser = async (email: string) => {
    try {
      setIsLoading(true);
      setStatus("idle");
      setErrCode(undefined);

      const data = await callApi<null>({
        method: "post",
        endpoint: "/news-letter/subscribe",
        body: { email },
      });

      if (data.status) {
        setStatus("success");
      } else {
        setStatus("failed");
        setErrCode(data.error?.code);
      }
    } catch (error: any) {
      const errCode: string = error.response.data.error.code;

      setErrCode(errCode);
      setStatus("failed");
    } finally {
      setIsLoading(false);
    }
  };

  return { status, isLoading, errCode, subscribeUser };
}

export default useNewsletter;
