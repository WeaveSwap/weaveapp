// @ts-nocheck
/* eslint-disable no-restricted-globals */

// Provide configured baseHref
const fetchBaseHref = async () => {
  const manifestUrl = "manifest.json";

  const cache = await caches.open("v2");
  let response = await cache.match(manifestUrl);

  if (!response) {
    try {
      await cache.add(manifestUrl);
      response = await cache.match(manifestUrl);
    } catch (error) {
      console.error("Failed to fetch manifest:", error);
      throw error;
    }
  }

  const manifest = await response.json();
  const baseHref = manifest.start_url;

  return baseHref;
};

const addResourcesToCache = async (resources) => {
  try {
    const cache = await caches.open("v2");
    await cache.addAll(resources);
  } catch (error) {
    console.error("Failed to cache resources:", error);
    throw error;
  }
};

const cacheFirst = async (request) => {
  try {
    // Check if the request URL has a supported scheme
    const supportedSchemes = ["http:", "https:"];
    if (!supportedSchemes.includes(new URL(request.url).protocol)) {
      // If the request has an unsupported scheme, fetch and return the response directly
      return fetch(request);
    }

    // Try to get the resource from the cache
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
      return responseFromCache;
    }

    // Try to get the resource from the network
    const responseFromNetwork = await fetch(request);
    const cache = await caches.open("v2");
    // Cache the fetched response
    await cache.put(request, responseFromNetwork.clone());
    return responseFromNetwork;
  } catch (error) {
    console.error("Failed to fetch resource:", error);
    throw error;
  }
};

// Enable navigation preload
const enableNavigationPreload = async () => {
  if (self.registration.navigationPreload) {
    await self.registration.navigationPreload.enable();
  }
};

self.addEventListener("activate", (event) => {
  event.waitUntil(enableNavigationPreload());
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        await addResourcesToCache([await fetchBaseHref()]);
      } catch (error) {
        console.error(
          "Failed to add resources to cache during install:",
          error,
        );
        throw error;
      }
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  if (!["POST", "PUT", "DELETE"].includes(event.request.method))
    event.respondWith(cacheFirst(event.request));
});
