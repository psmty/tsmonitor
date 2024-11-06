import express from 'express';
import {handler as ssrHandler} from './dist/server/entry.mjs';
import {CrawlerService} from './src/services/api/server/crawler/CrawlerService.ts';

const app = express();

// Change this based on your astro.config.mjs, `base` option.
// They should match. The default value is "/".
const base = '/';
app.use(base, express.static('dist/client/'));
app.use(ssrHandler);

app.on('listening', function () {
  console.log('RUN');
  const crawlerService = CrawlerService.getInstance();
  crawlerService.start();
});

app.listen(8080);
