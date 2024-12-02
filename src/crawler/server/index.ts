import express, { type Request, type Response } from "express";
import { json } from "body-parser";
import { crawler } from "./service";
import { streamEvents } from "./stream";

const app = express();
const PORT = process.env.CRAWLER_PORT || 3000;
const router = express.Router();


// Root route
router.get('/', streamEvents);
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract data from the request body
    const requestData = req.body;

    // Call the crawlAllSites method with the extracted data
    await crawler.crawlAllSites(requestData);

    // Send a successful response
    res.status(200).json({ message: 'Crawl initiated successfully.' });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error initiating crawl:', error);

    // Send an error response
    res.status(500).json({ error: 'Failed to crawl.' });
  }
})

// Middleware to parse JSON bodies
app.use(json());

// Use the router
app.use(router);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});