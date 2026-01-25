export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details: any;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  hasNext: boolean;
  totalPage: number;
}
