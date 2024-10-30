import type { APIRoute } from "astro";
import { db } from '../../db';
import { parseString } from "../../services";
const action = "/Home/VersionInfo";

async function getVersions(input: string[] = []) {
  const responses = await Promise.all(
    input.map((url) =>
      fetch(url + action)
        .then((r) => r.text())
        .then(parseString)
        .then((res) => ({ url, ...res }))
    )
  );
  return responses;
}

export const GET: APIRoute = async ({ locals, request }) => {
  try {
    const res = await db.query('SELECT * FROM sites;');
    
  const data = await getVersions(res.rows.map((r: { url: string }) => r.url));


    return new Response(JSON.stringify(data));
  } catch (error) {
    console.error('Database connection error:', error);
    return new Response('Failed to fetch data from PostgreSQL', { status: 500 });
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
