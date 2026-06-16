import axios from "axios";
import env from "../config/env";

interface ApiRequest {
  body?: any;
  method: "post" | "get" | "put" | "delete" | "patch";
  params?: any;
  endpoint: string;
  withAuth?: boolean;
}

export interface Pagination {
  totalPage: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

interface ApiResponse<T> {
  status: boolean;
  message: string;
  data?: T;
  pagination?: Pagination;
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
  withAuth = true,
}: ApiRequest): Promise<ApiResponse<T>> {
  try {
    const url = env.BACKEND_URL + "/api/v1" + endpoint;
    const authToken = localStorage.getItem("accessToken");

    const headers = {
      "Content-Type": "application/json",
    };

    if (withAuth) headers["Authorization"] = `Bearer ${authToken}`;

    const res = await axios({
      method,
      url,
      params,
      headers,
      data: JSON.stringify(body),
      withCredentials: true,
    });

    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export default callApi;
