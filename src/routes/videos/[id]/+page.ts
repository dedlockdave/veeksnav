import { videos } from '$lib/data/videos';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const video = videos.find((v) => v.id === params.id);
	if (!video) {
		error(404, 'Video not found');
	}
	return { video };
};
