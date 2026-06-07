import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { config } from "../config";

export async function GET(context: APIContext) {
	const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
	);

	return rss({
		title: `${config.name} — Blog`,
		description: "Notes on what I'm building.",
		site: context.site ?? "https://acox.me",
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: `/blog/${post.id}/`,
		})),
	});
}
