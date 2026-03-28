import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { GATEWAY_CONFIG_DIR } from '$lib/server/gateway';

const JOBS_PATH = join(GATEWAY_CONFIG_DIR, 'cron', 'jobs.json');

/** PUT /api/gateway/jobs/[jobId] — toggle enabled/disabled */
export const PUT: RequestHandler = async ({ params, request }) => {
	const body = await request.json();
	const { enabled } = body as { enabled: boolean };

	if (typeof enabled !== 'boolean') {
		throw error(400, 'Missing or invalid "enabled" field');
	}

	const raw = await readFile(JOBS_PATH, 'utf-8');
	const data = JSON.parse(raw);

	const job = data.jobs?.find((j: { id: string }) => j.id === params.jobId);
	if (!job) throw error(404, 'Job not found');

	// Safety backup
	await copyFile(JOBS_PATH, JOBS_PATH + '.bak');

	job.enabled = enabled;
	job.updatedAtMs = Date.now();

	await writeFile(JOBS_PATH, JSON.stringify(data, null, 2));
	return json(job);
};
