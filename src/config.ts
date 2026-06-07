/* =====================================================================
 *  Site config — the single source of truth for content & theme.
 *  Edit data here; components and styles read from it. Fully typed.
 * ===================================================================== */

export type IconName = "github" | "linkedin" | "bluesky";

export interface LinkItem {
	label: string;
	url: string;
	icon?: IconName;
	/**
	 * Whether the link points off-site. When omitted it's inferred from the URL
	 * (anything starting with "http" is treated as external). External links
	 * open in a new tab; internal links (e.g. "/blog") navigate in place.
	 */
	external?: boolean;
}

export interface BioLine {
	text: string;
	/** render in muted color */
	dim?: boolean;
}

/** A menu-bar entry: either a dropdown (has `items`) or a direct link (`url`). */
export interface DropdownMenu {
	label: string;
	items: LinkItem[];
}
export interface LinkMenu {
	label: string;
	url: string;
	external?: boolean;
}
export type MenuEntry = DropdownMenu | LinkMenu;

/** Type guard: is this menu entry a dropdown? */
export function isDropdownMenu(menu: MenuEntry): menu is DropdownMenu {
	return "items" in menu;
}

/** Resolve whether a link is external (explicit flag wins; else infer from URL). */
export function linkIsExternal(link: {
	url: string;
	external?: boolean;
}): boolean {
	return link.external ?? /^https?:\/\//i.test(link.url);
}

/**
 * Wallpaper — a discriminated union on `type`.
 * Switch the active wallpaper by changing `config.wallpaper` below.
 *
 *  - gradient : the layered CSS gradient (default look)
 *  - image    : a full-screen background image + optional overlay
 *  - video    : a looping background video, either a direct file/CDN URL
 *               (provider "file") or a YouTube embed (provider "youtube").
 *               A `poster` still is shown on mobile / reduced-motion.
 */
export interface GradientWallpaper {
	type: "gradient";
	base: string;
	warm: string;
	mid: string;
	cool: string;
	glow: string;
}
export interface ImageWallpaper {
	type: "image";
	/** path relative to /public, or an absolute URL */
	src: string;
	base?: string;
	/** CSS background value layered on top for legibility */
	overlay?: string;
	position?: string;
	size?: string;
}
export interface FileVideoWallpaper {
	type: "video";
	provider: "file";
	/** direct .mp4/.webm URL (self-hosted or CDN) */
	src: string;
	poster?: string;
	base?: string;
	overlay?: string;
}
export interface YouTubeVideoWallpaper {
	type: "video";
	provider: "youtube";
	/** the 11-char YouTube video id */
	youtubeId: string;
	poster?: string;
	base?: string;
	overlay?: string;
}
export type VideoWallpaper = FileVideoWallpaper | YouTubeVideoWallpaper;
export type Wallpaper = GradientWallpaper | ImageWallpaper | VideoWallpaper;

/** Default overlay tint (warm-brown → blue) used over image/video wallpapers. */
export const DEFAULT_OVERLAY =
	"linear-gradient(155deg, rgba(156,122,82,0.45) 0%, rgba(40,44,70,0.55) 45%, rgba(66,95,199,0.5) 100%)";

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
	/** menu-bar entries — dropdowns or direct links */
	menus: MenuEntry[];
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

	// Desktop wallpaper — switch the `type` to change the background.
	wallpaper: {
		// type: "gradient",
		// base: "#0b0e14",
		// warm: "rgba(156, 122, 82, 0.55)",
		// mid: "rgba(40, 44, 70, 0.65)",
		// cool: "rgba(66, 95, 199, 0.6)",
		// glow: "rgba(88, 166, 255, 0.25)",
		type: "video",
		provider: "youtube",
		youtubeId: "M3dhlboim9E",
		poster: "/wallpapers/desktop.jpg", // shown on mobile / reduced-motion
		overlay: DEFAULT_OVERLAY,
	},
	// --- Other wallpaper options (replace `wallpaper` above with one of these) ---
	//
	// Image background:
	// wallpaper: {
	// 	type: "image",
	// 	src: "/wallpapers/desktop.jpg",
	// 	base: "#0b0e14",
	// 	overlay: DEFAULT_OVERLAY, // optional tint for legibility
	// },
	//
	// Video background via YouTube (recommended — provider handles encoding/CDN):
	// wallpaper: {
	// 	type: "video",
	// 	provider: "youtube",
	// 	youtubeId: "XXXXXXXXXXX",
	// 	poster: "/wallpapers/desktop.jpg", // shown on mobile / reduced-motion
	// 	overlay: DEFAULT_OVERLAY,
	// },
	//
	// Video background via a direct file/CDN URL:
	// wallpaper: {
	// 	type: "video",
	// 	provider: "file",
	// 	src: "https://cdn.example.com/bg.mp4",
	// 	poster: "/wallpapers/desktop.jpg",
	// 	overlay: DEFAULT_OVERLAY,
	// },

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
		{ label: "Blog", url: "/blog" },
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
