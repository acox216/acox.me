/**
 * Makes window cards draggable by their title bar.
 *
 * Usage: give a window element `data-window="<id>"` and its drag handle
 * `data-drag-handle`, then call `initDraggable()` once on the page.
 *
 * Behaviour:
 *  - Desktop only (min-width 768px + fine pointer). On smaller/touch screens the
 *    window stays centered and drag is disabled (avoids fighting touch-scroll).
 *  - Movement is an offset applied via `transform: translate3d()` on top of the
 *    existing flex-centering, so layout stays responsive.
 *  - The offset is clamped so the title bar can't leave the viewport.
 *  - On desktop the offset persists to localStorage; double-clicking the title
 *    bar recenters and clears the saved position.
 */

interface Point {
	x: number;
	y: number;
}

const DESKTOP = "(min-width: 768px) and (pointer: fine)";
const MENUBAR_H = 30; // keep the title bar below the menu bar
const STORAGE_PREFIX = "win:";

function storageKey(id: string): string {
	return `${STORAGE_PREFIX}${id}:pos`;
}

function loadPos(id: string): Point | null {
	try {
		const raw = localStorage.getItem(storageKey(id));
		if (!raw) return null;
		const p = JSON.parse(raw) as Partial<Point>;
		if (typeof p.x === "number" && typeof p.y === "number") {
			return { x: p.x, y: p.y };
		}
	} catch {
		/* ignore malformed storage */
	}
	return null;
}

function savePos(id: string, pos: Point): void {
	try {
		localStorage.setItem(storageKey(id), JSON.stringify(pos));
	} catch {
		/* storage may be unavailable (private mode) — non-fatal */
	}
}

function clearPos(id: string): void {
	try {
		localStorage.removeItem(storageKey(id));
	} catch {
		/* ignore */
	}
}

/** Clamp an offset so the element's title bar stays within the viewport. */
function clamp(el: HTMLElement, offset: Point): Point {
	const rect = el.getBoundingClientRect();
	// Current rect already includes the active transform; back it out to get the
	// element's natural (centered) box, then compute allowed travel.
	const naturalLeft = rect.left - offset.x;
	const naturalTop = rect.top - offset.y;

	const minX = -naturalLeft + 8;
	const maxX = window.innerWidth - naturalLeft - rect.width - 8;
	const minY = -naturalTop + MENUBAR_H + 8;
	const maxY = window.innerHeight - naturalTop - rect.height - 8;

	return {
		x: Math.min(Math.max(offset.x, minX), Math.max(minX, maxX)),
		y: Math.min(Math.max(offset.y, minY), Math.max(minY, maxY)),
	};
}

function applyTransform(el: HTMLElement, offset: Point): void {
	el.style.transform = `translate3d(${offset.x}px, ${offset.y}px, 0)`;
}

/** Hand transform control to inline styles (see the .committed CSS rule). */
function commit(el: HTMLElement): void {
	el.classList.add("committed");
}

// Track initialized elements + their re-clamp callbacks so a single shared
// resize listener can keep every window on-screen (and so re-running
// initDraggable after a client-side navigation never double-binds).
const initialized = new WeakSet<HTMLElement>();
const instances: Array<{ el: HTMLElement; reclamp: () => void }> = [];
let resizeBound = false;

function makeDraggable(el: HTMLElement): void {
	if (initialized.has(el)) return;
	initialized.add(el);

	const id = el.dataset.window!;
	const handle = el.querySelector<HTMLElement>("[data-drag-handle]");
	if (!handle) return;

	let offset: Point = { x: 0, y: 0 };
	let start: Point = { x: 0, y: 0 };
	let origin: Point = { x: 0, y: 0 };
	let dragging = false;

	// Restore a saved position immediately (skip the entrance animation jump).
	const saved = loadPos(id);
	if (saved) {
		commit(el);
		offset = clamp(el, saved);
		applyTransform(el, offset);
	} else {
		// Otherwise let the entrance animation play, then take over.
		el.addEventListener("animationend", () => commit(el), { once: true });
	}

	const onPointerMove = (e: PointerEvent) => {
		if (!dragging) return;
		const next = {
			x: origin.x + (e.clientX - start.x),
			y: origin.y + (e.clientY - start.y),
		};
		offset = clamp(el, next);
		applyTransform(el, offset);
	};

	const onPointerUp = (e: PointerEvent) => {
		if (!dragging) return;
		dragging = false;
		el.classList.remove("is-dragging");
		document.body.classList.remove("is-dragging");
		handle.releasePointerCapture(e.pointerId);
		savePos(id, offset);
	};

	handle.addEventListener("pointerdown", (e: PointerEvent) => {
		// Only primary button / touch / pen.
		if (e.button !== 0) return;
		commit(el); // ensure inline transform wins even mid-animation
		dragging = true;
		start = { x: e.clientX, y: e.clientY };
		origin = { ...offset };
		el.classList.add("is-dragging");
		document.body.classList.add("is-dragging");
		handle.setPointerCapture(e.pointerId);
		e.preventDefault();
	});

	handle.addEventListener("pointermove", onPointerMove);
	handle.addEventListener("pointerup", onPointerUp);
	handle.addEventListener("pointercancel", onPointerUp);

	// Double-click the title bar → recenter and forget saved position.
	handle.addEventListener("dblclick", () => {
		offset = { x: 0, y: 0 };
		applyTransform(el, offset);
		clearPos(id);
	});

	// Register for shared resize re-clamping.
	instances.push({
		el,
		reclamp: () => {
			offset = clamp(el, offset);
			applyTransform(el, offset);
		},
	});
}

export function initDraggable(): void {
	// Gate to desktop pointers; mobile keeps the window centered.
	if (!window.matchMedia(DESKTOP).matches) return;

	// One resize listener for all windows; prune any that have been removed.
	if (!resizeBound) {
		resizeBound = true;
		window.addEventListener("resize", () => {
			for (let i = instances.length - 1; i >= 0; i--) {
				if (instances[i].el.isConnected) instances[i].reclamp();
				else instances.splice(i, 1);
			}
		});
	}

	document
		.querySelectorAll<HTMLElement>("[data-window]")
		.forEach((el) => makeDraggable(el));
}
