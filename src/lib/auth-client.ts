// import { env } from "@/env"
// import { createAuthClient } from "better-auth/react"

// const baseURL = `${env.NEXT_PUBLIC_FRONTEND_URL}/api/auth`;


// export const authClient = createAuthClient({
//     /** The base URL of the server (optional if you're using the same domain) */
//     // baseURL: env.NEXT_PUBLIC_BACKEND_URL,
//     baseURL,
// })

// import { createAuthClient } from "better-auth/react";

// export const authClient = createAuthClient({
//   baseURL: `${typeof window !== "undefined" ? window.location.origin : ""}/api/auth`,
//   fetchOptions: {
//     credentials: "include",
//   },
// });

import { env } from "@/env";
import { createAuthClient } from "better-auth/react";


const origin =
  typeof window !== "undefined" ? window.location.origin : env.NEXT_PUBLIC_FRONTEND_URL || "";

export const authClient = createAuthClient({
  baseURL: `${origin}/api/auth`,
  fetchOptions: {
    credentials: "include",
  },
});