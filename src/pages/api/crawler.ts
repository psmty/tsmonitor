import type { APIRoute } from "astro";
import type { CrawlerParsed, SitesData } from "../../services";
import { chunkArray } from "../../crawler/server/helpers";
import { CONCURRENCY_LIMIT, getInstance } from "../../crawler/server";

export const GET: APIRoute = async ({ request }) => {
  const connectionID = crypto.randomUUID();

  // Creating a ReadableStream to push events
  const stream = new ReadableStream({
    start: async (controller) => {
      const sendEvent = (data: Array<CrawlerParsed>) => {
        try {
          // Check if controller is open
          if (controller.desiredSize === null) {
            stream.cancel();
            return;
          }
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        } catch (error) {
          if (controller.desiredSize === null) {
            stream.cancel();
          }
          console.error(`EventSource is failed: ${error}`);
        }
      };

      await getInstance().connectClient(connectionID, sendEvent);
    },
    cancel: (controller) => {
      getInstance().disconnectClient(connectionID);
      controller.close();
    },
  });

  // Returning the Response with the stream as the body
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const sites: SitesData[] = await request.json();

    const siteChunks = chunkArray(sites, CONCURRENCY_LIMIT);
    const crawler = getInstance();

    for (const chunk of siteChunks) {
      // Send events with updated data
      const parsedChunk = await crawler.fetchAndSaveToFile(chunk);
      await crawler.notifyClients(parsedChunk);
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify(error), {
      status: 500,
      statusText: "Failed to fetch data",
    });
  }
};
