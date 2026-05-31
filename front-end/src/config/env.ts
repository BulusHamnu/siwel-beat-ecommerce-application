interface ENV {
  BACKEND_URL: string;
}

const env: ENV = {
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL as string,
};

export default env;
