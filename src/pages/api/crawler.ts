import type {APIRoute} from "astro";
import {CrawlerService} from '../../services/api/server/crawler/crawlerService.ts';
import type {CrawlerParsed, SitesData} from '../../services';

const crawlerService = CrawlerService.getInstance();

export const GET: APIRoute = async (context) => {

  // Creating a ReadableStream to push events
  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (data: Array<CrawlerParsed>) => {
        try {
          // Check if controller is open
          if (controller.desiredSize === null) {
            crawlerService.stop();
            return;
          }
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        } catch (error) {
          crawlerService.stop();
          console.error(`EventSource is failed: ${error}`);
        }
      };

      crawlerService.start(context, sendEvent);
    },
    cancel(controller) {
      crawlerService.stop();
      controller.close();
    }

  });

  // Returning the Response with the stream as the body
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
};


export const POST: APIRoute = async ({request}) => {
  try {
    const sites: SitesData[] = await request.json();

    const siteChunks = CrawlerService.chunkArray(sites, CrawlerService.CONCURRENCY_LIMIT);

    for (const chunk of siteChunks) {
      // Send events with updated data
      await crawlerService.loadData(chunk);
    }

    return new Response(null, {status: 200});
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify(error), {
      status: 500,
      statusText: "Failed to fetch data"
    });
  }
};
