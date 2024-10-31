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
  const urls: string[] = await request.json();
  const { rows: savedRows } = await db.query("SELECT * FROM sites;");

  const filterUrls = new Set(savedRows.map((row) => row.url));
  const filteredUrls = urls.filter((url) => !filterUrls.has(url));

  try {
    if (!filteredUrls.length) {
      return new Response("No new URL was added.", {
        status: 200,
      });
    }

    const values = filteredUrls.map((value, idx) => `($${idx + 1})`).join(',');
    const sql = `INSERT INTO sites ("url") VALUES ${values}`;

    await db.query(sql, filteredUrls);

    return new Response(JSON.stringify(filteredUrls));
  } catch (error) {
    console.error("Database connection error:", error);
    return new Response("Failed to fetch data from PostgreSQL", {
      status: 500,
    });
  }
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
