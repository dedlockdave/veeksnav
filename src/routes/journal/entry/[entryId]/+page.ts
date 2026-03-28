import { getEntry, getThread, getTopic } from '$lib/data/journal';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const entry = getEntry(params.entryId);
	if (!entry) {
		error(404, 'Entry not found');
	}
	const thread = getThread(entry.threadId);
	const topics = entry.topics
		.map((ref) => getTopic(ref.topicId))
		.filter((t) => t !== undefined);
	return { entry, thread, topics };
};
