import {db} from './index.ts';
import type {SitesData} from '../services/site.types.ts';

export async function getSites(): Promise<SitesData[]>  {
  const {rows} = await db.query("SELECT * FROM sites ORDER BY url;");
  return rows;
}

export async function updateSiteSettings(siteData: SitesData) {
  const sql = `
      UPDATE sites
      SET settings = $1
      WHERE url = $2
      RETURNING *;
    `;

  const values = [siteData.settings, siteData.url];
  return await db.query(sql, values);
}

export async function setSites(sitesDataArray: SitesData[]) {
  const sql = `
    INSERT INTO sites (url, settings)
    VALUES ${sitesDataArray.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2}::json)`).join(", ")}
    ON CONFLICT (url)
    DO UPDATE SET settings = EXCLUDED.settings
    RETURNING *
    ORDER BY url;
  `;

  const values = sitesDataArray.flatMap(siteData => [siteData.url, JSON.stringify(siteData.settings)]);
  return await db.query(sql, values);
}

export async function deleteSites(urls: Array<string>) {
  if (urls.length === 0) {
    return { rowCount: 0 }; // No URLs to delete
  }

  const sql = `
    DELETE FROM sites
    WHERE url = ANY($1::text[])
    RETURNING *;
  `;

  const values = [urls];
  return await db.query(sql, values);
}
