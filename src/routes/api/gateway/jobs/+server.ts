import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { GATEWAY_CONFIG_DIR } from '$lib/server/gateway';

/** GET /api/gateway/jobs — list all cron jobs */
export const GET: RequestHandler = async () => {
	try {
		const raw = await readFile(join(GATEWAY_CONFIG_DIR, 'cron', 'jobs.json'), 'utf-8');
		const data = JSON.parse(raw);
		return json(data.jobs ?? []);
	} catch {
		return json([]);
	}
};
