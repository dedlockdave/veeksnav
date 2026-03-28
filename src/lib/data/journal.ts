import type { JournalEntry, JournalTopic } from '$lib/types';
import entriesData from './journal/entries.json';
import topicsData from './journal/topics.json';

export const entries: JournalEntry[] = entriesData as JournalEntry[];
export const topics: JournalTopic[] = topicsData as JournalTopic[];

export function getEntriesByTopic(topicId: string): JournalEntry[] {
	return entries.filter((e) => e.topics.some((t) => t.topicId === topicId));
}

export function getThread(threadId: string): JournalEntry[] {
	return entries
		.filter((e) => e.threadId === threadId)
		.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function getEntry(entryId: string): JournalEntry | undefined {
	return entries.find((e) => e.entryId === entryId);
}

export function getTopic(topicId: string): JournalTopic | undefined {
	return topics.find((t) => t.topicId === topicId);
}

export function getRecentEntries(limit = 20): JournalEntry[] {
	return [...entries]
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.slice(0, limit);
}

export function getUniqueThreads(): string[] {
	return [...new Set(entries.map((e) => e.threadId))];
}
