import { createAuthClient } from "better-auth/react";
import { getAuthToken } from "./portal/storage";



const BACKEND_AUTH_URL = "http://localhost:4000/api/auth";
export const authClient = createAuthClient({
  baseURL: BACKEND_AUTH_URL,
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => getAuthToken(), 
    },
    throw: true,
  },
});