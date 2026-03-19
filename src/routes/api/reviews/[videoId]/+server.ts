import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { VideoReviewState } from '$lib/types';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const DATA_DIR = join(process.cwd(), '.data', 'reviews');

async function ensureDir() {
	await mkdir(DATA_DIR, { recursive: true });
}

function filePath(videoId: string) {
	// Sanitize to prevent path traversal
	const safe = videoId.replace(/[^a-zA-Z0-9_-]/g, '');
	return join(DATA_DIR, `${safe}.json`);
}

export const GET: RequestHandler = async ({ params }) => {
	const { videoId } = params;
	if (!videoId) throw error(400, 'Missing videoId');

	try {
		const data = await readFile(filePath(videoId), 'utf-8');
		return json(JSON.parse(data));
	} catch (e: unknown) {
		if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'ENOENT') {
			throw error(404, 'No review found');
		}
		throw error(500, 'Failed to read review');
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const { videoId } = params;
	if (!videoId) throw error(400, 'Missing videoId');

	const body: VideoReviewState = await request.json();

	// Validate
	if (body.videoId !== videoId) {
		throw error(400, 'videoId mismatch');
	}

	await ensureDir();
	const state: VideoReviewState = {
		videoId: body.videoId,
		videoStatus: body.videoStatus,
		clipStatuses: body.clipStatuses,
		clipEdits: body.clipEdits,
		updatedAt: new Date().toISOString()
	};

	await writeFile(filePath(videoId), JSON.stringify(state, null, 2));
	return json({ success: true, state });
};
