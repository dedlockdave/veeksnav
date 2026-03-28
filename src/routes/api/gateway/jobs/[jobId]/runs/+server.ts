import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { GatewayCronRun } from '$lib/types';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { GATEWAY_CONFIG_DIR } from '$lib/server/gateway';

/** GET /api/gateway/jobs/[jobId]/runs — get run history */
export const GET: RequestHandler = async ({ params, url }) => {
	const limit = parseInt(url.searchParams.get('limit') ?? '20', 10);

	try {
		const raw = await readFile(
			join(GATEWAY_CONFIG_DIR, 'cron', 'runs', `${params.jobId}.jsonl`),
			'utf-8'
		);

		const runs: GatewayCronRun[] = raw
			.split('\n')
			.filter((line) => line.trim())
			.map((line) => JSON.parse(line))
			.sort((a, b) => b.ts - a.ts)
			.slice(0, limit);

		return json(runs);
	} catch {
		return json([]);
	}
};
