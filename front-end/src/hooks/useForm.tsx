import { useState } from "react";
import callApi from "../lib/callApi";
// import { AxiosError } from "axios";

function useForm() {
  const [submiting, setSumitting] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errCode, setErrCode] = useState<string | undefined>(undefined);

  const sendMessage = async (body: any) => {
    try {
      setSumitting(true);
      setStatus("idle");
      setErrCode(undefined);

      const data = await callApi<null>({
        body,
        method: "post",
        endpoint: "/contact-me",
      });

      if (data.status) {
        setStatus("success");
      } else {
        setStatus("failed");
        setErrCode(data.error?.code);
      }
    } catch (error: any) {
      setStatus("failed");
      console.log(error.response.data);

      const errCode: string = error.response.data.error.code;
      setErrCode(errCode);
      //
    } finally {
      setSumitting(false);
    }
  };

  return { submiting, status, errCode, sendMessage };
}

export default useForm;
