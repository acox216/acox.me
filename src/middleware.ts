import { defineMiddleware } from "astro:middleware";

/**
 * Edge-cache the SSR blog routes with the Cloudflare Cache API so Ghost isn't
 * hit on every request. The blog pages set their own `Cache-Control: s-maxage`,
 * which the cached clone carries — cache.match honors it for freshness. We
 * return the original response untouched (its headers are immutable and its
 * body is streamed) and only clone it for the cache write.
 *
 * Phase 2 adds a Ghost webhook to purge entries for instant publishes.
 */
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
		if (hit) return hit;

		const response = await next();
		if (response.ok && !response.headers.has("set-cookie")) {
			const write = cache.put(key, response.clone());
			if (locals.cfContext?.waitUntil) locals.cfContext.waitUntil(write);
			else await write;
		}
		return response;
	}
);
