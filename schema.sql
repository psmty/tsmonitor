/**
 * https://developers.cloudflare.com/d1/get-started/
 * npx wrangler d1 execute tempus-db --local --file=./schema.sql
 *
 * deploy npx wrangler d1 execute tempus-db --remote --file=./schema.sql
 */
DROP TABLE IF EXISTS Sites;
CREATE TABLE IF NOT EXISTS Sites (Url TEXT PRIMARY KEY, Settings JSON);
INSERT INTO Sites (Url) VALUES ('https://staging.tempus-resource.com/sg'), ('https://alpha.tempus-resource.com/qa/next/normal');