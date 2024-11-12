import GitHub from "@auth/core/providers/github";
import MS from "@auth/core/providers/microsoft-entra-id";
import Google from "@auth/core/providers/google";
import { defineConfig } from "auth-astro";
import 'dotenv/config';


const providers = [];
if (process.env.GOOGLE_CLIENT_ID) {
  providers.push(Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }));
}
if (process.env.MS_CLIENT_ID) {
  providers.push(MS({
    clientId: process.env.MS_CLIENT_ID,
    clientSecret: process.env.MS_CLIENT_SECRET,
    tenantId: process.env.MS_TENANT_ID,
    authorization: {
      params: {
        scope: 'openid profile email',
      },
    },
  }));
}
if (process.env.GITHUB_CLIENT_ID) {
  providers.push(GitHub({
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  }));
}

export default defineConfig({
  callbacks: {
    signIn: ({ user, profile }) => {
      try {
        const allowed = JSON.parse(process.env.ALLOWED_EMAILS);
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
