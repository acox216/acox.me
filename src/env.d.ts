/// <reference path="../.astro/types.d.ts" />

// Runtime environment bindings (Cloudflare vars + secrets).
interface Env {
	/** Ghost site URL, e.g. https://cms.acox.dev (wrangler.jsonc var) */
	GHOST_URL?: string;
	/** Ghost read-only Content API key (secret) */
	GHOST_CONTENT_API_KEY?: string;
	/** Cloudflare Access service token id for the Worker → Ghost (secret) */
	CF_ACCESS_CLIENT_ID?: string;
	/** Cloudflare Access service token secret (secret) */
	CF_ACCESS_CLIENT_SECRET?: string;
}

// Cloudflare bindings accessor (Astro v6 / @astrojs/cloudflare v13).
declare module "cloudflare:workers" {
	export const env: Env;
}

// Workers extends the global CacheStorage with a `default` cache.
interface CacheStorage {
	default: {
		match(request: Request): Promise<Response | undefined>;
		put(request: Request, response: Response): Promise<void>;
	};
}

declare namespace App {
	interface Locals {
		/** Cloudflare execution context (e.g. waitUntil), from @astrojs/cloudflare. */
		cfContext?: { waitUntil(promise: Promise<unknown>): void };
	}
}
