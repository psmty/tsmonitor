/**
 * https://developers.cloudflare.com/d1/get-started/
 * run local db:
 * npx wrangler d1 execute tempus-db --local --file=./init.sql
 *
 * deploy:
 * npx wrangler d1 execute tempus-db --remote --file=./init.sql
 */

DROP TABLE IF EXISTS sites;
CREATE TABLE IF NOT EXISTS sites (Url TEXT PRIMARY KEY, settings JSON);
INSERT INTO sites (url) VALUES ('https://staging.tempus-resource.com/sg');