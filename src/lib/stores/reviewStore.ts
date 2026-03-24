import type { VideoReviewState, ClipEdit } from '$lib/types';

const STORAGE_KEY = 'veeksnav-reviews';

/** Load all review states from localStorage */
function loadAll(): Record<string, VideoReviewState> {
	if (typeof window === 'undefined') return {};
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}

/** Save all review states to localStorage */
function saveAll(data: Record<string, VideoReviewState>) {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Load review state for a specific video */
export function loadReview(videoId: string): VideoReviewState | null {
	const all = loadAll();
	return all[videoId] ?? null;
}

/** Save review state for a specific video (localStorage + server) */
export function saveReview(state: VideoReviewState) {
	// localStorage — instant
	const all = loadAll();
	all[state.videoId] = { ...state, updatedAt: new Date().toISOString() };
	saveAll(all);

	// Server — async, fire-and-forget
	syncToServer(state).catch(() => {
		// silently fail — localStorage is the source of truth for now
	});
}

/** Sync review state to server API */
async function syncToServer(state: VideoReviewState): Promise<void> {
	await fetch(`/api/reviews/${state.videoId}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(state)
	});
}

/** Load review state from server (fallback if localStorage is empty) */
export async function loadReviewFromServer(videoId: string): Promise<VideoReviewState | null> {
	try {
		const res = await fetch(`/api/reviews/${videoId}`);
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}
