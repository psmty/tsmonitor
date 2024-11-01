import type { APIRoute } from "astro";
import { db } from "../../db";
import type {SitesData} from '../../services';

export const GET: APIRoute = async ({ locals, request }) => {
  try {
    const { rows } = await db.query("SELECT * FROM sites;");

    return new Response(JSON.stringify(rows));
  } catch (error) {
    console.error("Database connection error:", error);
    return new Response("Failed to fetch data from PostgreSQL", {
      status: 500,
    });
  }
};

export const POST: APIRoute = async ({ props, locals, request }) => {
  // TODO: Add ability to save settings
  const sites: SitesData[] = await request.json();
  const { rows: savedRows } = await db.query("SELECT * FROM sites;");

  const existingSites = new Set(savedRows.map((row) => row.url));
  const newSites: SitesData[] = [];
  const sitesToMerge: SitesData[] = [];

  for (const site of sites) {
    const existingSite = existingSites.has(site.url);
    if (existingSite) {
      sitesToMerge.push(site)
    } else {
      newSites.push(site);
    }
  }

  try {
    if (!newSites.length && !existingSites.size) {
      return new Response("No new URL was added.", {
        status: 200,
      });
    }

    // Save new Sites
    if (newSites.length) {
      const values: Array<unknown> = [];
      const placeholders = newSites.map((value, idx) => {
        const baseIndex = idx * 2;
        values.push(value.url, value.settings); // Push url and second_column values
        return `($${baseIndex + 1}, $${baseIndex + 2})`
      }).join(',');
      const sql = `INSERT INTO sites ("url", "settings") VALUES ${placeholders}`;

      await db.query(sql, values);
    }

    // Merge new values
    if (sitesToMerge.length) {
// TODO: Implement merging
    }

// TODO: Return rows all  data
    return new Response(JSON.stringify(newSites));
  } catch (error) {
    console.error("Database connection error:", error);
    return new Response("Failed to fetch data from PostgreSQL", {
      status: 500,
    });
  }
};

export const PUT: APIRoute = async ({ props, locals, request }) => {
    const sql = `
      UPDATE sites
      SET settings = $1
      WHERE url = $2
      RETURNING *;
    `;

  try {
    const settings: SitesData = await request.json();

    const values = [settings.settings, settings.url]
    await db.query(sql, values);

    return new Response(JSON.stringify(settings));
  } catch (error) {
    console.error("Database connection error:", error);
    return new Response("Failed to fetch data from PostgreSQL", {
      status: 500,
    });
  }
};

export const DELETE: APIRoute = ({ request }) => {
  return new Response(
    JSON.stringify({
      message: "This was a DELETE!",
    })
  );
};

export const ALL: APIRoute = ({ request }) => {
  return new Response(
    JSON.stringify({
      message: `This was a ${request.method}!`,
    })
  );
};
