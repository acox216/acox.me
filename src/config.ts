/* =====================================================================
 *  Site config — the single source of truth for content & theme.
 *  Edit data here; components and styles read from it. Fully typed.
 * ===================================================================== */

export type IconName = "github" | "linkedin" | "bluesky";

export interface LinkItem {
	label: string;
	url: string;
	icon?: IconName;
}

export interface BioLine {
	text: string;
	/** render in muted color */
	dim?: boolean;
}

export interface Menu {
	label: string;
	items: LinkItem[];
}

export interface Wallpaper {
	base: string;
	warm: string;
	mid: string;
	cool: string;
	glow: string;
}

export interface SiteConfig {
	name: string;
	greeting: string;
	subtitle: string;
	/** path relative to /public */
	avatar: string;
	windowPath: string;
	accent: string;
	description: string;
	bio: BioLine[];
	wallpaper: Wallpaper;
	/** social/link buttons shown in the window */
	links: LinkItem[];
	/** menu-bar dropdowns — add a "Favorites" menu here later */
	menus: Menu[];
}

export const config: SiteConfig = {
	name: "Alex Cox",
	greeting: "Hi, I'm Alex",
	subtitle: "Software Developer",
	avatar: "/profile.jpg",
	windowPath: "~/alcox",
	accent: "#58a6ff",
	description: "Alex Cox — Software Developer.",

	bio: [
		{ text: "Software developer currently working in the e-commerce industry." },
		{
			text: "Driven to help people grow and improve the lives of many.",
			dim: true,
		},
	],

	// Desktop wallpaper — retune the gradient here.
	wallpaper: {
		base: "#0b0e14",
		warm: "rgba(156, 122, 82, 0.55)",
		mid: "rgba(40, 44, 70, 0.65)",
		cool: "rgba(66, 95, 199, 0.6)",
		glow: "rgba(88, 166, 255, 0.25)",
	},

	links: [
		{ label: "GitHub", url: "https://github.com/acox216", icon: "github" },
		{
			label: "LinkedIn",
			url: "https://www.linkedin.com/in/acox216/",
			icon: "linkedin",
		},
		{ label: "Bluesky", url: "https://bsky.app/profile/acox.me", icon: "bluesky" },
	],

	menus: [
		{
			label: "Connect",
			items: [
				{ label: "GitHub", url: "https://github.com/acox216", icon: "github" },
				{
					label: "LinkedIn",
					url: "https://www.linkedin.com/in/acox216/",
					icon: "linkedin",
				},
				{
					label: "Bluesky",
					url: "https://bsky.app/profile/acox.me",
					icon: "bluesky",
				},
			],
		},
		// Future: a favorites menu — just uncomment and fill in.
		// {
		// 	label: "Favorites",
		// 	items: [{ label: "Hacker News", url: "https://news.ycombinator.com" }],
		// },
	],
};
