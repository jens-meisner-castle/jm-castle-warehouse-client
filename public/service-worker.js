const version = "0.8.0";

console.log(`execute service-worker.js (version: ${version})`);
/* eslint-disable */
const cacheName = "jm-castle-warehouse";
const whitelistedPathRegex = /\/api\/[^.]*$/;
const cachePaths = new Set();
cachePaths.add("/favicon.ico");
cachePaths.add("/manifest.json");
cachePaths.add("/castle192.png");
let token = "";

const addToken = (request) => {
  const destURL = new URL(request.url);
  if (token && token.length && whitelistedPathRegex.test(destURL.pathname)) {
    const modifiedHeaders = new Headers(request.headers);
    modifiedHeaders.append("Authorization", token);
    return (authReq = new Request(request, { headers: modifiedHeaders }));
  }
  return request;
};

self.addEventListener("install", (event) => {
  console.log("install + delete old cache", event);
  caches.delete(cacheName);
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("activate", event);
  return self.clients.claim();
});

self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SET_TOKEN") {
    token = event.data.token;
    console.log("token set!");
    return;
  }
  if (event.data && event.data.type === "RESET_TOKEN") {
    token = "";
    console.log("token  reset!");
    return;
  }
});

const shouldUseCache = (pathname) => {
  return cachePaths.has(pathname);
};

const fetchCached = async (request) => {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  const response = await fetch(request);
  const cache = await caches.open(cacheName);
  cache.put(request, response.clone());
  return response;
};

self.addEventListener("fetch", function (event) {
  const url = new URL(event.request.url);
  if (url.pathname === "/service-worker/exists") {
    const response = new Response(
      JSON.stringify({ response: { exists: true } })
    );
    return event.respondWith(response);
  }
  const preparedRequest = addToken(event.request);
  return shouldUseCache(url.pathname)
    ? event.respondWith(fetchCached(preparedRequest))
    : event.respondWith(fetch(preparedRequest));
});
