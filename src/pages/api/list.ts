import type { APIRoute } from "astro";
import type {SitesData} from '../../services';
import {
  getSites,
  updateSiteSettings, setSites
} from '../../services/api/list/DBQueries.ts';
import {getUpdatedSites, getSitesMap} from '../../services/api/list/helpers.ts';

export const GET: APIRoute = async ({ locals, request }) => {
  try {
    const rows = await getSites();

    return new Response(JSON.stringify(rows));
  } catch (error) {
    console.error("Database connection error:", error);
    return new Response("Failed to fetch data from PostgreSQL", {
      status: 500,
    });
  }
};

export const POST: APIRoute = async ({ props, locals, request }) => {
  try {
    const sites: SitesData[] = await request.json();
    const savedRows = await getSites();

    const existingSitesMap = getSitesMap(savedRows);
    const addedSites = getUpdatedSites(sites, existingSitesMap)

    if (!addedSites.length) {
      return new Response("No new URL was added.", {
        status: 200,
      });
    }

    if (addedSites.length) {
      await setSites(addedSites);
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
    await updateSiteSettings(siteData);

    return new Response(JSON.stringify(siteData));
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
