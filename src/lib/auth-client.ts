import { createAuthClient } from "better-auth/react";
import { getAuthToken } from "./portal/storage";


const BACKEND_AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || "https://ngv-backend.vercel.app/api/auth";
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