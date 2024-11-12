import GitHub from "@auth/core/providers/github";
import MS from "@auth/core/providers/microsoft-entra-id";
import Google from "@auth/core/providers/google";
import { defineConfig } from "auth-astro";

const providers = [];
if (import.meta.env.GOOGLE_CLIENT_ID) {
  providers.push(Google({
    clientId: import.meta.env.GOOGLE_CLIENT_ID,
    clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
  }));
}
if (import.meta.env.MS_CLIENT_ID) {
  providers.push(MS({
    clientId: import.meta.env.MS_CLIENT_ID,
    clientSecret: import.meta.env.MS_CLIENT_SECRET,
    tenantId: import.meta.env.MS_TENANT_ID,
    authorization: {
      params: {
        scope: 'openid profile email',
      },
    },
  }));
}
if (import.meta.env.GITHUB_CLIENT_ID) {
  providers.push(GitHub({
    clientId: import.meta.env.GITHUB_CLIENT_ID,
    clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
  }));
}

export default defineConfig({
  callbacks: {
    signIn: ({ user, profile }) => {
      try {
        const allowed = JSON.parse(import.meta.env.ALLOWED_EMAILS);
        if (!allowed || allowed.length === 0) {
          return true;
        }
        const isAllowed = allowed?.some((email) =>  user?.email.includes(email) || profile?.email.includes(email));
        return isAllowed;
      } catch (e) {
        return true;
      }
    },
  },
  providers,
});
