import { defineMiddleware } from "astro:middleware";
import { getSession } from "auth-astro/server";
import 'dotenv/config';


// `context` and `next` are automatically typed
export const onRequest = defineMiddleware(async (context, next) => {
    if (process.env.SKIP_AUTH) {
        return next();
    }
    const loggedin = await getSession(context.request);
    if (!loggedin && !context.url.pathname.includes("/api/auth")) {
        return context.redirect("/api/auth/signin");
    }
    const response = await next();
    return response;
});
