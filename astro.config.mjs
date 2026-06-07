// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// Output defaults to "static": every page is prerendered to ./dist and served
// directly by Cloudflare. The Cloudflare adapter is wired in so we can opt
// individual routes into on-demand edge rendering later with
// `export const prerender = false` (enables endpoints, KV/D1/R2, etc.).
export default defineConfig({
	site: "https://acox.me",
	adapter: cloudflare(),
	integrations: [mdx(), sitemap()],
	markdown: {
		shikiConfig: {
			theme: "github-dark",
			wrap: true,
		},
	},
});
