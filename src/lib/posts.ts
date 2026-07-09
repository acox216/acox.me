/**
 * Unified post model that merges two sources into one /blog:
 *  - Ghost (general writing, published from Ulysses) — fetched at request time
 *  - MDX files in src/content/blog (technical/code posts) — in-repo
 */

import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import { getPosts, getPostBySlug, type GhostPost } from "./ghost";

export interface Post {
	source: "ghost" | "mdx";
	slug: string;
	title: string;
	excerpt: string;
	date: Date;
	updatedDate?: Date;
	tags: string[];
	heroImage?: string;
	readingTime?: number;
}

function fromGhost(post: GhostPost): Post {
	return {
		source: "ghost",
		slug: post.slug,
		title: post.title,
		excerpt: post.custom_excerpt ?? post.excerpt ?? "",
		date: new Date(post.published_at),
		updatedDate: post.updated_at ? new Date(post.updated_at) : undefined,
		tags: (post.tags ?? []).map((t) => t.name),
		heroImage: post.feature_image ?? undefined,
		readingTime: post.reading_time ?? undefined,
	};
}

function fromMdx(entry: CollectionEntry<"blog">): Post {
	return {
		source: "mdx",
		slug: entry.id,
		title: entry.data.title,
		excerpt: entry.data.description,
		date: entry.data.pubDate,
		updatedDate: entry.data.updatedDate,
		tags: entry.data.tags ?? [],
		heroImage: entry.data.heroImage,
	};
}

/** Whether to include drafts (dev only). */
const includeEntry = ({ data }: CollectionEntry<"blog">) =>
	import.meta.env.PROD ? !data.draft : true;

/** Every post from both sources, newest first. */
export async function getAllPosts(): Promise<Post[]> {
	const mdx = (await getCollection("blog", includeEntry)).map(fromMdx);
	const ghost = (await getPosts()).map(fromGhost);
	return [...ghost, ...mdx].sort((a, b) => b.date.valueOf() - a.date.valueOf());
}

export type ResolvedPost =
	| { source: "mdx"; meta: Post; entry: CollectionEntry<"blog"> }
	| { source: "ghost"; meta: Post; html: string };

/** Resolve a single post by slug — MDX takes precedence, then Ghost. */
export async function getPost(slug: string): Promise<ResolvedPost | null> {
	const entry = await getEntry("blog", slug);
	if (entry && includeEntry(entry)) {
		return { source: "mdx", meta: fromMdx(entry), entry };
	}
	const ghostPost = await getPostBySlug(slug);
	if (ghostPost) {
		return { source: "ghost", meta: fromGhost(ghostPost), html: ghostPost.html };
	}
	return null;
}
