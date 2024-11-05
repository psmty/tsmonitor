import type { APIRoute } from "astro";
import type {SitesData} from '../../services';
import {
  getSites,
  updateSiteSettings, setSites, deleteSites
} from '../../services/api/server/list/DBQueries.ts';
import {getUpdatedSites, getSitesMap} from '../../services/api/server/list/helpers.ts';

export const GET: APIRoute = async (context) => {
  try {
    const rows = await getSites(context);

    return new Response(JSON.stringify(rows));
  } catch (error) {
    console.error("Database connection error:", error);
    return new Response("Failed to fetch data from PostgreSQL", {
      status: 500,
    });
  }
};

export const POST: APIRoute = async (context) => {
  try {
    const sites: SitesData[] = await context.request.json();
    const savedRows = await getSites(context);

    const existingSitesMap = getSitesMap(savedRows);
    const addedSites = getUpdatedSites(sites, existingSitesMap)

    if (!addedSites.length) {
      return new Response(JSON.stringify(null), {
        status: 200,
      });
    }

    if (addedSites.length) {
      await setSites(context, addedSites);
    }

    return new Response(JSON.stringify(addedSites));
  } catch (error) {
    console.error("Database connection error:", error);
    return new Response("Failed to fetch data from PostgreSQL", {
      status: 500,
    });
  }
};

export const PUT: APIRoute = async ({ props, locals, request }) => {
  try {
    const siteData: SitesData = await request.json();
    await updateSiteSettings(locals.runtime.env.DATABASE.prepare, siteData);

    return new Response(JSON.stringify(siteData));
  } catch (error) {
    console.error("Database connection error:", error);
    return new Response("Failed to fetch data from PostgreSQL", {
      status: 500,
    });
  }
};

export const DELETE: APIRoute = async ({ locals, request }) => {
  try {
    const urlsForDeletion: string[] = await request.json();
    const deletedRows = await deleteSites(locals.runtime.env.DATABASE.prepare, urlsForDeletion);

    return new Response(JSON.stringify(deletedRows));
  } catch (error) {
    console.error("Database connection error:", error);
    return new Response("Failed to fetch data from PostgreSQL", {
      status: 500,
    });
  }
};

export const ALL: APIRoute = ({ request }) => {
  return new Response(
    JSON.stringify({
      message: `This was a ${request.method}!`,
    })
  );
};