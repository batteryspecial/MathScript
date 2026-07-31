"use client";

import { twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// No baseURL: same-origin means the client defaults to window.location.origin,
// which is also why there is no CORS config anywhere in this setup.
export const authClient = createAuthClient({
    plugins: [twoFactorClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
