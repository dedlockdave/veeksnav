<script lang="ts">
	import type { Video } from '$lib/types';

	let { video }: { video: Video } = $props();
</script>

<div class="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors group">
	<!-- Thumbnail / Video preview -->
	<div class="aspect-video bg-zinc-800 relative">
		{#if video.thumbnail}
			<img
				src={video.thumbnail}
				alt={video.title}
				class="w-full h-full object-cover"
			/>
		{:else}
			<div class="w-full h-full flex items-center justify-center text-zinc-600">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</div>
		{/if}
		{#if video.duration}
			<span class="absolute bottom-2 right-2 bg-black/80 text-xs text-white px-2 py-0.5 rounded">
				{video.duration}
			</span>
		{/if}
	</div>

	<!-- Info -->
	<div class="p-4">
		<h3 class="font-semibold text-white mb-1 group-hover:text-indigo-400 transition-colors">
			{video.title}
		</h3>
		<p class="text-zinc-400 text-sm line-clamp-2 mb-3">{video.description}</p>
		<div class="flex flex-wrap gap-1.5">
			{#each video.tags as tag}
				<span class="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{tag}</span>
			{/each}
		</div>
	</div>
</div>
