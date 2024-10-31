import type { APIRoute } from "astro";
import { db } from "../../db";

export const GET: APIRoute = async ({ locals, request }) => {
  try {
    const { rows } = await db.query("SELECT * FROM sites;");

    return new Response(JSON.stringify(rows));
  } catch (error) {
    console.error("Database connection error:", error);
    return new Response("Failed to fetch data from PostgreSQL", {
      status: 500,
    });
  }
};

export const POST: APIRoute = async ({ props, locals, request }) => {
  return new Response(
    JSON.stringify({
      data: await request.json(),
      message: "This was a POST!",
    })
  );
};

export const DELETE: APIRoute = ({ request }) => {
  return new Response(
    JSON.stringify({
      message: "This was a DELETE!",
    })
  );
};

export const ALL: APIRoute = ({ request }) => {
  return new Response(
    JSON.stringify({
      message: `This was a ${request.method}!`,
    })
  );
};
