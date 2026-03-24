<script lang="ts">
	import { videos } from '$lib/data/videos';

	const reviewCount = videos.filter((v) => v.status === 'review').length;
</script>

<section class="py-16 text-center">
	<h1 class="text-5xl font-bold tracking-tight mb-4">
		Veeks<span class="text-indigo-400">Nav</span>
	</h1>
	<p class="text-zinc-400 text-lg max-w-xl mx-auto mb-8">
		Content review dashboard. Analyze bodycam footage, review clips, and approve posts.
	</p>
	<a
		href="/videos"
		class="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-lg transition-colors"
	>
		{#if reviewCount > 0}
			Review Content ({reviewCount} pending) →
		{:else}
			Browse Reviews →
		{/if}
	</a>
</section>
