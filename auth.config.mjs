import GitHub from "@auth/core/providers/github";
import MS from "@auth/core/providers/microsoft-entra-id";
import Google from "@auth/core/providers/google";
import { defineConfig } from "auth-astro";

export default defineConfig({
  callbacks: {
    signIn: ({ user, profile }) => {
      return (
        profile?.email?.endsWith("@prosymmetry.com") ||
        user?.email?.endsWith("@prosymmetry.com") ||
        user?.email.startsWith("mojpo4tovik") ||
        user?.email.includes("kudrytski")
      );
    },
  },
  providers: [
    Google({
      clientId: import.meta.env.GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: import.meta.env.GITHUB_CLIENT_ID,
      clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
    }),
    MS({
      clientId: import.meta.env.MS_CLIENT_ID,
      clientSecret: import.meta.env.MS_CLIENT_SECRET,
    }),
  ],
});
