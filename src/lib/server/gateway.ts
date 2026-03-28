import { join } from 'node:path';
import { env } from '$env/dynamic/private';

export const GATEWAY_CONFIG_DIR =
	env.GATEWAY_CONFIG_PATH || join(process.cwd(), '..', '..', 'gateway-config');
