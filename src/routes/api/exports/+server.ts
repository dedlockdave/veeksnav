import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { VideoExport, VideoReviewState, ExportClip } from '$lib/types';
import { videos } from '$lib/data/videos';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const EXPORTS_DIR = join(process.cwd(), '.data', 'exports');
const REVIEWS_DIR = join(process.cwd(), '.data', 'reviews');

async function ensureDir() {
	await mkdir(EXPORTS_DIR, { recursive: true });
}

function safeName(id: string) {
	return id.replace(/[^a-zA-Z0-9_-]/g, '');
}

/** GET /api/exports — list all exports for downstream agent polling */
export const GET: RequestHandler = async ({ url }) => {
	await ensureDir();

	const statusFilter = url.searchParams.get('status');

	try {
		const files = await readdir(EXPORTS_DIR);
		const exports: VideoExport[] = [];

		for (const file of files) {
			if (!file.endsWith('.json')) continue;
			const data = await readFile(join(EXPORTS_DIR, file), 'utf-8');
			const exp: VideoExport = JSON.parse(data);
			if (statusFilter && exp.status !== statusFilter) continue;
			exports.push(exp);
		}

		exports.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
		return json(exports);
	} catch {
		return json([]);
	}
};

/** POST /api/exports — publish an approved video to the export queue */
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const videoId: string = body.videoId;
	if (!videoId) throw error(400, 'Missing videoId');

	// Load video data
	const video = videos.find((v) => v.id === videoId);
	if (!video) throw error(404, 'Video not found');

	// Load review state
	let review: VideoReviewState;
	try {
		const data = await readFile(join(REVIEWS_DIR, `${safeName(videoId)}.json`), 'utf-8');
		review = JSON.parse(data);
	} catch {
		throw error(400, 'No review state found — review the video first');
	}

	if (review.videoStatus !== 'approved') {
		throw error(400, 'Video must be approved before publishing');
	}

	// Build accepted clips with edits applied
	const acceptedClips: ExportClip[] = video.clips
		.filter((c) => review.clipStatuses[c.id] === 'accepted')
		.map((c) => {
			const edit = review.clipEdits[c.id];
			if (edit) {
				const start = edit.newStart;
				const end = edit.newEnd;
				return {
					id: c.id,
					title: c.title,
					description: c.description,
					assessment: c.assessment,
					timestamp: `${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}-${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`,
					startSeconds: start,
					endSeconds: end,
					rating: c.rating,
					url: c.url,
					editNotes: edit.notes || undefined,
					wasEdited: true
				};
			}
			return {
				id: c.id,
				title: c.title,
				description: c.description,
				assessment: c.assessment,
				timestamp: c.timestamp,
				startSeconds: c.startSeconds,
				endSeconds: c.endSeconds,
				rating: c.rating,
				url: c.url,
				wasEdited: false
			};
		});

	if (acceptedClips.length === 0) {
		throw error(400, 'No accepted clips — accept at least one clip before publishing');
	}

	const now = new Date().toISOString();

	const exportData: VideoExport = {
		videoId: video.id,
		title: video.title,
		description: video.description,
		sourceUrl: video.sourceUrl,
		sourceVideoUrl: video.sourceVideoUrl,
		duration: video.duration,
		durationSeconds: video.durationSeconds,
		tags: video.tags,
		summary: video.analysis.summary,
		scorecard: video.analysis.scorecard,
		clips: acceptedClips,
		teachableMoments: video.analysis.teachableMoments,
		postDrafts: video.analysis.postDrafts,
		status: 'queued',
		publishedAt: now,
		updatedAt: now
	};

	await ensureDir();
	await writeFile(
		join(EXPORTS_DIR, `${safeName(videoId)}.json`),
		JSON.stringify(exportData, null, 2)
	);

	return json({ success: true, export: exportData });
};
