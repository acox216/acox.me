/**
 * Minimal, Workers-friendly Ghost Content API client (plain `fetch`, no Node
 * SDK). Reads config from the Cloudflare `env` binding. Returns empty/null and
 * logs on any misconfiguration or error so the site degrades gracefully when
 * Ghost is unreachable or unconfigured.
 */

import { env } from "cloudflare:workers";

export interface GhostTag {
	name: string;
	slug: string;
}

export interface GhostPost {
	id: string;
	slug: string;
	title: string;
	html: string;
	excerpt?: string | null;
	custom_excerpt?: string | null;
	feature_image?: string | null;
	published_at: string;
	updated_at: string;
	reading_time?: number | null;
	tags?: GhostTag[];
}

interface PostsResponse {
	posts: GhostPost[];
}

function isConfigured(): boolean {
	return Boolean(env.GHOST_URL && env.GHOST_CONTENT_API_KEY);
}

/** Headers include the CF Access service token so the Worker can reach a
 * Content API that sits behind a Cloudflare Access "Service Auth" policy. */
function buildHeaders(): HeadersInit {
	const headers: Record<string, string> = { "Accept-Version": "v5.0" };
	if (env.CF_ACCESS_CLIENT_ID && env.CF_ACCESS_CLIENT_SECRET) {
		headers["CF-Access-Client-Id"] = env.CF_ACCESS_CLIENT_ID;
		headers["CF-Access-Client-Secret"] = env.CF_ACCESS_CLIENT_SECRET;
	}
	return headers;
}

async function ghostFetch<T>(
	path: string,
	params: Record<string, string | number>
): Promise<T | null> {
	if (!isConfigured()) {
		console.warn(
			"[ghost] GHOST_URL / GHOST_CONTENT_API_KEY not set — skipping fetch"
		);
		return null;
	}
	const url = new URL(`/ghost/api/content/${path}`, env.GHOST_URL);
	url.searchParams.set("key", env.GHOST_CONTENT_API_KEY!);
	for (const [key, value] of Object.entries(params)) {
		url.searchParams.set(key, String(value));
	}
	try {
		const res = await fetch(url.toString(), { headers: buildHeaders() });
		if (!res.ok) {
			console.error(`[ghost] ${res.status} ${res.statusText} for /${path}`);
			return null;
		}
		return (await res.json()) as T;
	} catch (err) {
		console.error("[ghost] fetch failed", err);
		return null;
	}
}

/** All published posts (sorting handled by the caller). */
export async function getPosts(limit: number | "all" = "all"): Promise<GhostPost[]> {
	const data = await ghostFetch<PostsResponse>("posts/", {
		include: "tags,authors",
		formats: "html",
		limit,
	});
	return data?.posts ?? [];
}

/** A single published post by slug, or null if missing. */
export async function getPostBySlug(slug: string): Promise<GhostPost | null> {
	const data = await ghostFetch<PostsResponse>(
		`posts/slug/${encodeURIComponent(slug)}/`,
		{ include: "tags,authors", formats: "html" }
	);
	return data?.posts?.[0] ?? null;
}
