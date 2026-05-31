import axios from "axios";
import env from "../config/env";

interface ApiRequest {
  body?: any;
  method: "post" | "get" | "put" | "delete" | "patch";
  params?: any;
  endpoint: string;
}

interface ApiResponse<T> {
  status: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details: any;
  };
}

async function callApi<T>({
  body,
  method,
  params,
  endpoint,
}: ApiRequest): Promise<ApiResponse<T>> {
  try {
    const url = env.BACKEND_URL + "/api/v1" + endpoint;
    const authToken = localStorage.getItem("token");

    const res = await axios({
      method,
      url,
      params,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: body,
    });

    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export default callApi;
