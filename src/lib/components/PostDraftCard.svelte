<script lang="ts">
	import type { PostDraft } from '$lib/types';

	let { draft }: { draft: PostDraft } = $props();
	let copied = $state(false);

	function copyToClipboard() {
		const text = draft.hook + '\n\n' + draft.hashtags.map((h) => '#' + h).join(' ');
		navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
	<div class="flex items-start justify-between gap-3 mb-3">
		<span
			class="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full"
		>
			{draft.platform}
		</span>
		<button
			onclick={copyToClipboard}
			class="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
		>
			{#if copied}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-3.5 w-3.5 text-emerald-400"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
						clip-rule="evenodd"
					/>
				</svg>
				Copied!
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-3.5 w-3.5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
					/>
				</svg>
				Copy
			{/if}
		</button>
	</div>
	<p class="text-zinc-200 text-sm leading-relaxed mb-3">{draft.hook}</p>
	<div class="flex flex-wrap gap-1.5">
		{#each draft.hashtags as tag}
			<span class="text-xs text-indigo-400">#{tag}</span>
		{/each}
	</div>
</div>
