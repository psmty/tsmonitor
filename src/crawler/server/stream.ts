// routes/stream.ts

import type { Request, Response } from "express";
import crypto from "crypto";
import type { CrawlerParsed } from "../../services";

export const clientsSender = new Map<string, (data: Array<CrawlerParsed>) => void>();

export const streamEvents = (req: Request, res: Response) => {
  const connectionID = crypto.randomUUID();

  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Optional: Allow CORS if needed
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Send a comment to keep the connection alive in some proxies
  res.write(": connected\n\n");

  // Function to send data to the client
  const sendEvent = (data: Array<CrawlerParsed>) => {
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error(`Error sending event to client ${connectionID}:`, error);
      // Optionally, close the connection if needed
      res.end();
    }
  };

  // Register the client
  clientsSender.set(connectionID, sendEvent);

  // Handle client disconnect
  req.on("close", () => {
    console.log(`Client ${connectionID} disconnected`);

    clientsSender.delete(connectionID);
    res.end();
  });
};
