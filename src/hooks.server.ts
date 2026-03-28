import { handle as authHandle } from './auth';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const PUBLIC_PATHS = ['/login', '/auth'];

const guardHandle: Handle = async ({ event, resolve }) => {
	const session = await event.locals.auth();
	const path = event.url.pathname;

	const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p));

	if (!session?.user && !isPublic) {
		throw redirect(303, '/login');
	}

	return resolve(event);
};

export const handle = sequence(authHandle, guardHandle);
