<script lang="ts">
	import type { JournalEntry } from '$lib/types';

	let { entry }: { entry: JournalEntry } = $props();

	function timeAgo(iso: string) {
		const diff = Date.now() - new Date(iso).getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 60) return `${mins}m ago`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24) return `${hrs}h ago`;
		const days = Math.floor(hrs / 24);
		if (days < 30) return `${days}d ago`;
		return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	function preview(text: string, max = 200) {
		if (text.length <= max) return text;
		return text.slice(0, max).trimEnd() + '...';
	}
</script>

<a
	href="/journal/entry/{entry.entryId}"
	class="block bg-zinc-900 rounded-xl border border-zinc-800 p-4 hover:border-zinc-700 transition-colors"
>
	<div class="flex items-start gap-3">
		<div
			class="w-1 h-full min-h-[2.5rem] rounded-full shrink-0 {entry.author === 'david'
				? 'bg-indigo-500'
				: 'bg-zinc-600'}"
		></div>
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-2 mb-1">
				<span class="text-xs font-medium {entry.author === 'david' ? 'text-indigo-400' : 'text-zinc-500'}">
					{entry.author === 'david' ? 'David' : 'DatClaw'}
				</span>
				<span class="text-xs text-zinc-600">{timeAgo(entry.createdAt)}</span>
			</div>
			<p class="text-sm text-zinc-300 leading-relaxed">{preview(entry.content)}</p>
			{#if entry.topics.length > 0}
				<div class="flex flex-wrap gap-1.5 mt-2">
					{#each entry.topics as topic}
						<span class="text-xs bg-zinc-800/50 text-zinc-500 px-2 py-0.5 rounded-full">
							{topic.name}
						</span>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</a>
