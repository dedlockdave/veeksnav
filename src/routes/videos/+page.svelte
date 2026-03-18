<script lang="ts">
	import { videos } from '$lib/data/videos';
	import VideoCard from '$lib/components/VideoCard.svelte';
</script>

<svelte:head>
	<title>Reviews — VeeksNav</title>
</svelte:head>

<section>
	<div class="mb-8">
		<h1 class="text-3xl font-bold mb-2">Content Reviews</h1>
		<p class="text-zinc-400">Bodycam footage analysis — review clips, post drafts, and approve content.</p>
	</div>

	{#if videos.length === 0}
		<div class="text-center py-20 text-zinc-500">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-16 w-16 mx-auto mb-4 opacity-50"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
				/>
			</svg>
			<p class="text-lg font-medium mb-1">No videos in review</p>
			<p class="text-sm">Analyzed videos from the pipeline will appear here.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each videos as video (video.id)}
				<a href="/videos/{video.id}" class="block">
					<VideoCard {video} />
				</a>
			{/each}
		</div>
	{/if}
</section>
