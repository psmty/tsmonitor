import type { APIRoute } from "astro";
// import { db } from "../../db";
import type {SitesData} from '../../services';

// export const GET: APIRoute = async ({ locals, request }) => {
//   try {
//     const { rows } = await db.query("SELECT * FROM sites;");

//     return new Response(JSON.stringify(rows));
//   } catch (error) {
//     console.error("Database connection error:", error);
//     return new Response(JSON.stringify(error), {
//       status: 500,
//       statusText: "Failed to fetch data from PostgreSQL",
//     });
//   }
// };

// export const POST: APIRoute = async ({ props, locals, request }) => {
//   // TODO: Add ability to save settings
//   const urls: string[] = await request.json();
//   const { rows: savedRows } = await db.query("SELECT * FROM sites;");

//   const filterUrls = new Set(savedRows.map((row) => row.url));
//   const filteredUrls = urls.filter((url) => !filterUrls.has(url));

//   try {
//     if (!filteredUrls.length) {
//       return new Response("No new URL was added.", {
//         status: 200,
//       });
//     }

//     const values = filteredUrls.map((value, idx) => `($${idx + 1})`).join(',');
//     const sql = `INSERT INTO sites ("url") VALUES ${values}`;

//     await db.query(sql, filteredUrls);
// // TODO: Return rows all  data
//     return new Response(JSON.stringify(filteredUrls));
//   } catch (error) {
//     console.error("Database connection error:", error);
//     return new Response("Failed to fetch data from PostgreSQL", {
//       status: 500,
//     });
//   }
// };

// export const PUT: APIRoute = async ({ props, locals, request }) => {
//     const sql = `
//       UPDATE sites
//       SET settings = $1
//       WHERE url = $2
//       RETURNING *;
//     `;

//   try {
//     const settings: SitesData = await request.json();

//     const values = [settings.settings, settings.url]
//     await db.query(sql, values);

//     return new Response(JSON.stringify(settings));
//   } catch (error) {
//     console.error("Database connection error:", error);
//     return new Response("Failed to fetch data from PostgreSQL", {
//       status: 500,
//     });
//   }
// };

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







export const GET: APIRoute = async ({ locals, request }) => {
  try {
    // @ts-ignore
    const { results: rows } = await locals.runtime.env.DATABASE.prepare(
      "SELECT * FROM sites"
    ).run();

    return new Response(JSON.stringify(rows));
  } catch (error) {
    console.error("Database connection error:", error);
    return new Response(JSON.stringify(error), {
      status: 500,
      statusText: "Failed to fetch data from PostgreSQL",
    });
  }
};

export const POST: APIRoute = async ({ props, locals, request }) => {
  // TODO: Add ability to save settings
  const urls: string[] = await request.json();
   // @ts-ignore
    const { results: savedRows } = await locals.runtime.env.DATABASE.prepare("SELECT * FROM sites;");

  const filterUrls = new Set(savedRows.map((row: any) => row.url));
  const filteredUrls = urls.filter((url) => !filterUrls.has(url));

  try {
    if (!filteredUrls.length) {
      return new Response("No new URL was added.", {
        status: 200,
      });
    }

    const values = filteredUrls.map((value, idx) => `($${idx + 1})`).join(',');
    const sql = `INSERT INTO sites ("url") VALUES ${values}`;
    // @ts-ignore
    await locals.runtime.env.DATABASE.prepare(sql, filteredUrls);
// TODO: Return rows all  data
    return new Response(JSON.stringify(filteredUrls));
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
    // @ts-ignore
    await locals.runtime.env.DATABASE.prepare(sql, values);

    return new Response(JSON.stringify(settings));
  } catch (error) {
    console.error("Database connection error:", error);
    return new Response("Failed to fetch data from PostgreSQL", {
      status: 500,
    });
  }
};