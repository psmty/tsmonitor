import GitHub from "@auth/core/providers/github";
import MS from "@auth/core/providers/microsoft-entra-id";
import Google from "@auth/core/providers/google";
import { defineConfig } from "auth-astro";


export default defineConfig({
  callbacks: {
    signIn: ({ user, profile }) => {
      try {
        const allowed = JSON.parse(import.meta.env.ALLOWED_EMAILS);
        const isAllowed = allowed?.some((email) =>  user?.email.includes(email) || profile?.email.includes(email));
        return isAllowed;
      } catch (e) {
        return true;
      }
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
