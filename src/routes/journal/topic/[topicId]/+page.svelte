<script lang="ts">
	import { getThread } from '$lib/data/journal';
	import ThreadView from '$lib/components/journal/ThreadView.svelte';
	import type { JournalEntry, JournalTopic } from '$lib/types';

	let { data }: { data: { topic: JournalTopic; entries: JournalEntry[] } } = $props();

	// Group entries by thread (derived so it reacts to data changes)
	const threads = $derived.by(() => {
		const threadIds = [...new Set(data.entries.map((e) => e.threadId))];
		return threadIds
			.map((tid) => ({
				threadId: tid,
				entries: getThread(tid),
				firstAt: getThread(tid)[0]?.createdAt ?? ''
			}))
			.sort((a, b) => new Date(b.firstAt).getTime() - new Date(a.firstAt).getTime());
	});
</script>

<svelte:head>
	<title>{data.topic.name} — Journal — VeeksNav</title>
</svelte:head>

<section>
	<div class="mb-8">
		<a href="/journal" class="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
			&larr; Journal
		</a>
		<div class="flex items-center gap-3 mt-2">
			<div class="w-1.5 h-8 rounded-full" style="background-color: {data.topic.color}"></div>
			<div>
				<h1 class="text-3xl font-bold">{data.topic.name}</h1>
				{#if data.topic.description}
					<p class="text-zinc-400 text-sm mt-0.5">{data.topic.description}</p>
				{/if}
			</div>
		</div>
		<p class="text-xs text-zinc-500 mt-2">
			{data.entries.length} entr{data.entries.length === 1 ? 'y' : 'ies'} across {threads.length} conversation{threads.length === 1 ? '' : 's'}
		</p>
	</div>

	{#if threads.length === 0}
		<div class="text-center py-12 text-zinc-500">No entries for this topic yet.</div>
	{:else}
		<div class="space-y-8">
			{#each threads as thread (thread.threadId)}
				<div class="bg-zinc-900/50 rounded-xl border border-zinc-800 p-5">
					<ThreadView entries={thread.entries} />
				</div>
			{/each}
		</div>
	{/if}
</section>
