<script lang="ts">
	import type { JournalTopic } from '$lib/types';

	let { topic }: { topic: JournalTopic } = $props();

	function formatDate(iso: string) {
		if (!iso) return '';
		return new Date(iso).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<a
	href="/journal/topic/{topic.topicId}"
	class="block bg-zinc-900 rounded-xl border border-zinc-800 p-4 hover:border-zinc-700 transition-colors"
>
	<div class="flex items-start gap-3">
		<div class="w-1 h-10 rounded-full shrink-0" style="background-color: {topic.color}"></div>
		<div class="min-w-0 flex-1">
			<h3 class="text-sm font-semibold text-white truncate">{topic.name}</h3>
			{#if topic.description}
				<p class="text-xs text-zinc-400 mt-0.5 line-clamp-2">{topic.description}</p>
			{/if}
			<div class="flex items-center gap-2 mt-2 text-xs text-zinc-500">
				<span>{topic.entryCount} entr{topic.entryCount === 1 ? 'y' : 'ies'}</span>
				{#if topic.latestEntryAt}
					<span>·</span>
					<span>Latest {formatDate(topic.latestEntryAt)}</span>
				{/if}
			</div>
		</div>
	</div>
</a>
