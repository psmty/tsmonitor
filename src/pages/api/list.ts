import type { APIRoute } from "astro";
import type {SitesData} from '../../services';
import {
  getSites,
  setSites, deleteSites, updateMultipleSiteSettings, changeUrl
} from '../../db/DBQueries.ts';
import {getUpdatedSites, getSitesMap} from '../../services/api/server/list/helpers.ts';
import { getInstance } from "../../crawler/server/index.ts";

export const GET: APIRoute = async ({ locals, request }) => {
  try {
    // Start the crawler if it's not already running
    getInstance()?.startIfNotWorking();

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
    const addedSites = getUpdatedSites(sites, existingSitesMap);
    if (!addedSites.length) {
      return new Response(JSON.stringify(null), {
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
    const sitesData: SitesData[] = await request.json();
    await updateMultipleSiteSettings(sitesData);

    const changedUrls = sitesData.filter(({newUrl}) => !!newUrl);
    if (changedUrls.length) {
      await changeUrl(changedUrls);
    }

    return new Response(JSON.stringify(sitesData));
  } catch (error) {
    console.error("Database connection error:", error);
    return new Response("Failed to fetch data from PostgreSQL", {
      status: 500,
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const urlsForDeletion: string[] = await request.json();
    const deletedRows = await deleteSites(urlsForDeletion);

    await getInstance().deleteSites(urlsForDeletion);

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
