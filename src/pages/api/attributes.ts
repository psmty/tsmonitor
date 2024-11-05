import type { APIRoute } from "astro";
import { getAttributes } from "../../services/api/server/list/DBQueries";

export const GET: APIRoute = async ({ locals, request }) => {
    try {
      const rows = await getAttributes();
  
      return new Response(JSON.stringify(rows));
    } catch (error) {
      console.error("Database connection error:", error);
      return new Response("Failed to fetch data from PostgreSQL", {
        status: 500,
      });
    }
};
