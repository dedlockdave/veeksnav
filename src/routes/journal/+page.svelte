<script lang="ts">
	import { topics, getRecentEntries } from '$lib/data/journal';
	import TopicCard from '$lib/components/journal/TopicCard.svelte';
	import EntryCard from '$lib/components/journal/EntryCard.svelte';

	const recentEntries = getRecentEntries(20);
</script>

<svelte:head>
	<title>Journal — VeeksNav</title>
</svelte:head>

<section>
	<div class="mb-8">
		<h1 class="text-3xl font-bold mb-2">Journal</h1>
		<p class="text-zinc-400">Reflections and discussions from Discord, organized by topic.</p>
	</div>

	{#if topics.length === 0 && recentEntries.length === 0}
		<div class="text-center py-16">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-16 w-16 mx-auto mb-4 text-zinc-700"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
				/>
			</svg>
			<p class="text-zinc-500 text-lg font-medium mb-1">No journal entries yet</p>
			<p class="text-zinc-600 text-sm">
				Post in #journal on Discord to get started. Entries sync automatically.
			</p>
		</div>
	{:else}
		<!-- Topics grid -->
		{#if topics.length > 0}
			<div class="mb-10">
				<h2 class="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">Topics</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{#each topics as topic (topic.topicId)}
						<TopicCard {topic} />
					{/each}
				</div>
			</div>
		{/if}

		<!-- Recent entries -->
		{#if recentEntries.length > 0}
			<div>
				<h2 class="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">
					Recent Entries
				</h2>
				<div class="space-y-3">
					{#each recentEntries as entry (entry.entryId)}
						<EntryCard {entry} />
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</section>
