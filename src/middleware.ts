import { defineMiddleware } from "astro:middleware";

/**
 * Edge-cache the SSR blog routes with the Cloudflare Cache API so Ghost isn't
 * hit on every request.
 *
 * We attach `Cache-Control` here rather than in the pages: setting it via
 * `Astro.response.headers` inside a page throws "Can't modify immutable headers"
 * once middleware wraps the render (Astro finalizes those headers before the
 * page's `.set()` lands). Instead we rebuild the render output into a fresh
 * Response with a mutable Headers — this runs *after* the render, so it never
 * touches the immutable object.
 *
 * Phase 2 adds a Ghost webhook to purge entries for instant publishes.
 */
const TTL_SECONDS = 300;

const isCacheable = (pathname: string): boolean =>
	pathname === "/blog" || pathname.startsWith("/blog/");

export const onRequest = defineMiddleware(
	async ({ request, url, locals }, next) => {
		if (request.method !== "GET" || !isCacheable(url.pathname)) return next();

		// Global `caches` is the Cloudflare edge cache (absent in some dev contexts).
		const cache = typeof caches !== "undefined" ? caches.default : undefined;
		if (!cache) return next();

		const key = new Request(url.toString(), { method: "GET" });
		const hit = await cache.match(key);
		if (hit) {
			// Cache API responses have immutable headers; the runtime mutates the
			// returned response, so hand back a fresh (mutable) copy.
			return new Response(hit.body, {
				status: hit.status,
				statusText: hit.statusText,
				headers: new Headers(hit.headers),
			});
		}

		const response = await next();

		// Don't cache errors or anything carrying cookies.
		if (!response.ok || response.headers.has("set-cookie")) return response;

		// Rebuild with a fresh (mutable) Headers carrying Cache-Control. Stream the
		// body via clone() so both the cached copy and the client get it.
		const headers = new Headers(response.headers);
		headers.set("Cache-Control", `public, s-maxage=${TTL_SECONDS}`);
		const init: ResponseInit = {
			status: response.status,
			statusText: response.statusText,
			headers,
		};
		const forCache = new Response(response.clone().body, init);
		const forClient = new Response(response.body, init);

		const write = cache.put(key, forCache);
		if (locals.cfContext?.waitUntil) locals.cfContext.waitUntil(write);
		else await write;

		return forClient;
	}
);
