import type { APIRoute } from "astro";
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
  // @ts-ignore
  const dbdata = await locals.runtime.env.DATABASE.prepare(
    "SELECT * FROM Sites"
  ).run();

  const data = await getVersions(dbdata.results.map((r: { Url: string }) => r.Url));

  return new Response(
    JSON.stringify(data)
  );
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
