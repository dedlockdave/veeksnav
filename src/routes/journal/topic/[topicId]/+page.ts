import { getTopic, getEntriesByTopic } from '$lib/data/journal';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const topic = getTopic(params.topicId);
	if (!topic) {
		error(404, 'Topic not found');
	}
	const entries = getEntriesByTopic(params.topicId);
	return { topic, entries };
};
