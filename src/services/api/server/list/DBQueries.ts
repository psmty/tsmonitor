import type { APIContext } from 'astro';
import type {SitesData} from '../../../site.types.ts';

export async function getSites(context: APIContext): Promise<SitesData[]>  {
  const { results: rows } = await context.locals.runtime.env.DATABASE.prepare("SELECT * FROM sites;").run();
  rows.map((row) => row.settings = row.settings ? JSON.parse(row.settings) : null);
    
  return rows;
}

export async function updateSiteSettings(prepare: KVNamespace['prepare'], siteData: SitesData) {
  const sql = `
      UPDATE sites
      SET settings = ?1
      WHERE url = ?2
      RETURNING *;
    `;

  const values = [JSON.stringify(siteData.settings), siteData.url]
  return prepare(sql).bind(...values).run();
}

export async function setSites(context: APIContext, sitesDataArray: SitesData[]) {
  const sql = `
    INSERT INTO sites (url, settings)
    VALUES ${sitesDataArray.map((_, i) => `(?, ?)`).join(", ")}
    ON CONFLICT (url)
    DO UPDATE SET settings = EXCLUDED.settings
    RETURNING *;
  `;

  const values = sitesDataArray.flatMap(siteData => [siteData.url, JSON.stringify(siteData.settings)]);
  return context.locals.runtime.env.DATABASE.prepare(sql).bind(...values).run();
}

export async function deleteSites(prepare: KVNamespace['prepare'], urls: Array<string>) {
  if (urls.length === 0) {
    return { rowCount: 0 }; // No URLs to delete
  }

  const sql = `
    DELETE FROM sites
    WHERE url = ANY(?1::text[])
    RETURNING *;
  `;

  const values = [urls];
  return prepare(sql).bind(...values).run();
}
