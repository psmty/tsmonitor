import type { APIRoute } from "astro";
import { parseHtmlString } from "../../services/parser";
const action = "/Home/VersionInfo";

async function getVersions(input: string[] = []) {
  const responses = await Promise.all(
    input.map((url) =>
      fetch(url + action)
        .then((r) => r.text())
        .then(parseHtmlString)
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
    console.error(error);
    return new Response(JSON.stringify(error), {
      status: 500,
      statusText: "Failed to fetch data",
    });
  }
};