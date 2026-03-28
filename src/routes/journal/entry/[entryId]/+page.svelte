<script lang="ts">
	import ThreadView from '$lib/components/journal/ThreadView.svelte';
	import type { JournalEntry, JournalTopic } from '$lib/types';

	let {
		data
	}: { data: { entry: JournalEntry; thread: JournalEntry[]; topics: JournalTopic[] } } = $props();

	function formatDate(iso: string) {
		return new Date(iso).toLocaleString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Entry — Journal — VeeksNav</title>
</svelte:head>

<section>
	<div class="mb-6">
		<a href="/journal" class="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
			&larr; Journal
		</a>
		<p class="text-xs text-zinc-500 mt-3">{formatDate(data.entry.createdAt)}</p>
	</div>

	<!-- Topic pills -->
	{#if data.topics.length > 0}
		<div class="flex flex-wrap gap-2 mb-6">
			{#each data.topics as topic}
				<a
					href="/journal/topic/{topic.topicId}"
					class="flex items-center gap-1.5 text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full border border-zinc-700 hover:border-zinc-600 transition-colors"
				>
					<span class="w-2 h-2 rounded-full" style="background-color: {topic.color}"></span>
					{topic.name}
				</a>
			{/each}
		</div>
	{/if}

	<!-- Full thread -->
	<div class="bg-zinc-900/50 rounded-xl border border-zinc-800 p-3 sm:p-5">
		<h2 class="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
			Conversation Thread ({data.thread.length} message{data.thread.length === 1 ? '' : 's'})
		</h2>
		<ThreadView entries={data.thread} />
	</div>
</section>
