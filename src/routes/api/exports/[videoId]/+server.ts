import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { VideoExport } from '$lib/types';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const EXPORTS_DIR = join(process.cwd(), '.data', 'exports');

async function ensureDir() {
	await mkdir(EXPORTS_DIR, { recursive: true });
}

function filePath(videoId: string) {
	const safe = videoId.replace(/[^a-zA-Z0-9_-]/g, '');
	return join(EXPORTS_DIR, `${safe}.json`);
}

/** GET /api/exports/[videoId] — get a specific export */
export const GET: RequestHandler = async ({ params }) => {
	const { videoId } = params;
	if (!videoId) throw error(400, 'Missing videoId');

	try {
		const data = await readFile(filePath(videoId), 'utf-8');
		return json(JSON.parse(data));
	} catch (e: unknown) {
		if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'ENOENT') {
			throw error(404, 'Export not found');
		}
		throw error(500, 'Failed to read export');
	}
};

/** PATCH /api/exports/[videoId] — update export status (for downstream agent) */
export const PATCH: RequestHandler = async ({ params, request }) => {
	const { videoId } = params;
	if (!videoId) throw error(400, 'Missing videoId');

	const body = await request.json();
	const newStatus = body.status;

	if (!['queued', 'processing', 'posted', 'failed'].includes(newStatus)) {
		throw error(400, 'Invalid status');
	}

	await ensureDir();
	const fp = filePath(videoId);

	let exportData: VideoExport;
	try {
		const data = await readFile(fp, 'utf-8');
		exportData = JSON.parse(data);
	} catch {
		throw error(404, 'Export not found');
	}

	exportData.status = newStatus;
	exportData.updatedAt = new Date().toISOString();

	await writeFile(fp, JSON.stringify(exportData, null, 2));
	return json({ success: true, export: exportData });
};
