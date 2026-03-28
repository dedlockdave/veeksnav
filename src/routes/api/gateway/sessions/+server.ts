import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { GatewaySession } from '$lib/types';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { GATEWAY_CONFIG_DIR } from '$lib/server/gateway';

/** GET /api/gateway/sessions — list agent sessions */
export const GET: RequestHandler = async () => {
	try {
		const raw = await readFile(
			join(GATEWAY_CONFIG_DIR, 'agents', 'main', 'sessions', 'sessions.json'),
			'utf-8'
		);
		const data = JSON.parse(raw);

		const now = Date.now();
		const dayMs = 24 * 60 * 60 * 1000;

		const sessions: GatewaySession[] = Object.entries(data).map(
			([key, val]: [string, unknown]) => {
				const v = val as Record<string, unknown>;
				return {
					sessionKey: key,
					sessionId: v.sessionId as string,
					updatedAt: v.updatedAt as number,
					chatType: v.chatType as string | undefined,
					channel: (v.deliveryContext as Record<string, unknown>)?.channel as
						| string
						| undefined,
					origin: v.origin
						? {
								label: (v.origin as Record<string, unknown>).label as string | undefined,
								provider: (v.origin as Record<string, unknown>).provider as
									| string
									| undefined
							}
						: undefined,
					deliveryContext: v.deliveryContext as GatewaySession['deliveryContext'],
					model:
						(v.model as string) ??
						(v.fallbackNoticeActiveModel as string) ??
						undefined,
					contextTokens: (v.systemPromptReport as Record<string, unknown>)
						?.contextTokens as number | undefined,
					inputTokens: (v.systemPromptReport as Record<string, unknown>)?.inputTokens as
						| number
						| undefined,
					outputTokens: (v.systemPromptReport as Record<string, unknown>)
						?.outputTokens as number | undefined
				};
			}
		);

		sessions.sort((a, b) => b.updatedAt - a.updatedAt);

		const recentlyActive = sessions.filter((s) => now - s.updatedAt < dayMs).length;

		return json({ total: sessions.length, recentlyActive, sessions });
	} catch {
		return json({ total: 0, recentlyActive: 0, sessions: [] });
	}
};
