<script lang="ts">
	import { videos } from '$lib/data/videos';
	import VideoCard from '$lib/components/VideoCard.svelte';
	import AnimateIn from '$lib/components/AnimateIn.svelte';
	import StaggerChildren from '$lib/components/StaggerChildren.svelte';
	import StaggerItem from '$lib/components/StaggerItem.svelte';
	import { Motion } from 'svelte-motion';
</script>

<svelte:head>
	<title>Reviews — VeeksNav</title>
</svelte:head>

<section>
	<!-- Animated header -->
	<div class="mb-10">
		<Motion
			initial={{ opacity: 0, x: -40 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
			let:motion
		>
			<h1 use:motion class="text-4xl font-black tracking-tight text-white">
				Content Reviews
			</h1>
		</Motion>
		<Motion
			initial={{ opacity: 0, x: -30 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
			let:motion
		>
			<p use:motion class="text-zinc-400 mt-2">
				Bodycam footage analysis — review clips, post drafts, and approve content.
			</p>
		</Motion>

		<!-- Animated divider line -->
		<Motion
			initial={{ scaleX: 0 }}
			animate={{ scaleX: 1 }}
			transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
			let:motion
		>
			<div use:motion class="h-px bg-gradient-to-r from-indigo-500/50 via-violet-500/30 to-transparent mt-6 origin-left"></div>
		</Motion>
	</div>

	{#if videos.length === 0}
		<AnimateIn y={30} duration={0.6}>
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
		</AnimateIn>
	{:else}
		<StaggerChildren stagger={0.12} delayStart={0.3} class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
			{#each videos as video (video.id)}
				<StaggerItem y={40} scale={0.92}>
					<a href="/videos/{video.id}" class="block group">
						<div class="transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(99,102,241,0.12)]">
							<VideoCard {video} />
						</div>
					</a>
				</StaggerItem>
			{/each}
		</StaggerChildren>
	{/if}
</section>
