import type { APIRoute } from "astro";
import { parseString } from "../../services";
const action = "/Home/VersionInfo";

async function getVersions(input: string[] = []) {
  const responses = await Promise.all(
    input.map((url) =>
      fetch(url + action)
        .then((r) => r.text())
        .then(parseString)
        .then((res) => ({ ...res, url }))
    )
  );
  return responses;
}

export const POST: APIRoute = async ({ locals, request }) => {
  try {
    const urls: string[] = await request.json();
    const data = await getVersions(urls);

    return new Response(JSON.stringify(data));
  } catch (error) {
    return new Response("Failed to fetch data", {
      status: 500,
    });
  }
};