<script lang="ts">
	import type { JournalEntry } from '$lib/types';

	let { entries }: { entries: JournalEntry[] } = $props();

	function formatTime(iso: string) {
		return new Date(iso).toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	function shouldShowTimestamp(idx: number): boolean {
		if (idx === 0) return true;
		const prev = new Date(entries[idx - 1].createdAt).getTime();
		const curr = new Date(entries[idx].createdAt).getTime();
		return curr - prev > 3600000; // > 1 hour gap
	}
</script>

<div class="space-y-3">
	{#each entries as entry, idx (entry.entryId)}
		{#if shouldShowTimestamp(idx)}
			<div class="flex justify-center">
				<span class="text-xs text-zinc-600 bg-zinc-900 px-3 py-1 rounded-full">
					{formatTime(entry.createdAt)}
				</span>
			</div>
		{/if}

		<div class="flex {entry.author === 'david' ? 'justify-end' : 'justify-start'}">
			<div
				class="max-w-[90%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 {entry.author === 'david'
					? 'bg-indigo-600/20 border border-indigo-500/20 text-zinc-200'
					: 'bg-zinc-800 border border-zinc-700 text-zinc-300'}"
			>
				<p class="text-xs font-medium mb-1 {entry.author === 'david' ? 'text-indigo-400' : 'text-zinc-500'}">
					{entry.author === 'david' ? 'David' : 'DatClaw'}
				</p>
				<p class="text-sm leading-relaxed whitespace-pre-wrap">{entry.content}</p>
			</div>
		</div>
	{/each}
</div>
