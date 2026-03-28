import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { GATEWAY_CONFIG_DIR } from '$lib/server/gateway';

/** GET /api/gateway/config — get heartbeat and agent config */
export const GET: RequestHandler = async () => {
	const candidates = ['openclaw.json', 'openclaw.json.bak', 'openclaw.json.bak.1'];

	for (const file of candidates) {
		try {
			const raw = await readFile(join(GATEWAY_CONFIG_DIR, file), 'utf-8');
			const data = JSON.parse(raw);

			const defaults = data.agents?.defaults ?? {};
			return json({
				heartbeat: {
					every: defaults.heartbeat?.every ?? 'unknown',
					model: defaults.heartbeat?.model ?? undefined
				},
				primaryModel: defaults.model?.primary ?? data.agents?.list?.[0]?.model ?? 'unknown'
			});
		} catch {
			continue;
		}
	}

	return json({ heartbeat: { every: 'unknown' }, primaryModel: 'unknown' });
};
