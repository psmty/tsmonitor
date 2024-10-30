import { defineMiddleware } from "astro:middleware";
import { getSession } from "auth-astro/server";

// `context` and `next` are automatically typed
export const onRequest = defineMiddleware(async (context, next) => {
    if (context.url.pathname.includes("/api") && !context.url.pathname.includes("/auth")) {
        const loggedin = await getSession(context.request);
        if (!loggedin) {
            return new Response("Unauthorized", { status: 401 });
        }
    }
    const response = await next();
    // console.log("auth response", );
    return response;
});
