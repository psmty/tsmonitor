import {db} from './index.ts';
import type {SitesData} from '../services/site.types.ts';

export async function getSites(urls?: string[]): Promise<SitesData[]>  {
  if (urls?.length) {
    const {rows} = await db.query("SELECT * FROM sites WHERE url = ANY($1::text[]);", [urls]);
    return rows;
  }
  const {rows} = await db.query("SELECT * FROM sites ORDER BY url;");
  return rows;
}

export async function setUrlOnline(url: string, online: boolean) {
  const sql = `
      UPDATE sites
      SET online = $1,
          pingat = $2
      WHERE url = $3
      RETURNING *;
    `;

  const values = [online, new Date(), url];
  return await db.query(sql, values);
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

export async function updateMultipleSiteSettings(sitesData: SitesData[]) {
  const sql = `
    UPDATE sites
    SET settings = data.settings
    FROM (
      VALUES
      ${sitesData
        .map((_, index) => `($${index * 2 + 1}::json, $${index * 2 + 2}::text)`)
        .join(",\n")}
    ) AS data(settings, url)
    WHERE sites.url = data.url
    RETURNING *;
  `;

  const values = sitesData.flatMap((site) => [site.settings, site.newUrl ?? site.url]);
  return await db.query(sql, values);
}

export async function setSites(sitesDataArray: SitesData[]) {
  const sql = `
    INSERT INTO sites (url, settings)
    VALUES ${sitesDataArray.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2}::json)`).join(", ")}
    ON CONFLICT (url)
    DO UPDATE SET settings = EXCLUDED.settings
    RETURNING *;
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

export async function changeUrl(sites: SitesData[]) {
  const sql = `
    UPDATE sites
    SET url = CASE
      ${sites.map((_, i) => `WHEN url = $${i * 2 + 1} THEN $${i * 2 + 2}`).join(' ')}
    END
    WHERE url IN (${sites.map((_, i) => `$${i * 2 + 1}`).join(', ')});
  `;

  const params = sites.flatMap(({ url, newUrl }) => [url, newUrl]);

  await db.query(sql, params);
}
