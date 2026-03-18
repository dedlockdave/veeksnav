<script lang="ts">
	import type { Video } from '$lib/types';

	let { video }: { video: Video } = $props();

	const statusColors: Record<string, string> = {
		review: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
		approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
		rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
		posted: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
	};

	function scoreColor(score: number): string {
		if (score < 5) return 'text-red-400';
		if (score <= 7) return 'text-amber-400';
		return 'text-emerald-400';
	}
</script>

<div
	class="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors group"
>
	<div class="aspect-video bg-zinc-800 relative flex items-center justify-center">
		{#if video.thumbnail}
			<img src={video.thumbnail} alt={video.title} class="w-full h-full object-cover" />
		{:else}
			<div
				class="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-12 w-12 text-zinc-600 group-hover:text-indigo-400 transition-colors"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</div>
		{/if}
		{#if video.duration}
			<span class="absolute bottom-2 right-2 bg-black/80 text-xs text-white px-2 py-0.5 rounded">
				{video.duration}
			</span>
		{/if}
		<span
			class="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full border {statusColors[
				video.status
			]}"
		>
			{video.status}
		</span>
	</div>

	<div class="p-4">
		<h3 class="font-semibold text-white mb-1 group-hover:text-indigo-400 transition-colors">
			{video.title}
		</h3>
		<p class="text-zinc-400 text-sm line-clamp-2 mb-3">{video.description}</p>

		<div class="flex items-center justify-between mb-3">
			<div class="flex items-center gap-1">
				<span class="text-xs text-zinc-500">Overall:</span>
				<span class="text-sm font-bold {scoreColor(video.analysis.scorecard.overall)}"
					>{video.analysis.scorecard.overall}/10</span
				>
			</div>
			<span class="text-xs text-zinc-500"
				>{video.clips.length} clip{video.clips.length !== 1 ? 's' : ''}</span
			>
		</div>

		<div class="flex flex-wrap gap-1.5">
			{#each video.tags.slice(0, 3) as tag}
				<span class="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{tag}</span>
			{/each}
			{#if video.tags.length > 3}
				<span class="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full"
					>+{video.tags.length - 3}</span
				>
			{/if}
		</div>
	</div>
</div>
