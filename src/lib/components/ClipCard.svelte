<script lang="ts">
	import type { Clip } from '$lib/types';

	let { clip }: { clip: Clip } = $props();
</script>

<div class="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
	<div class="aspect-video bg-black">
		<video
			controls
			preload="metadata"
			class="w-full h-full"
			poster=""
		>
			<source src={clip.url} type="video/mp4" />
			<track kind="captions" />
			Your browser does not support video playback.
		</video>
	</div>
	<div class="p-4">
		<div class="flex items-start justify-between gap-2 mb-2">
			<h4 class="font-semibold text-white">{clip.title}</h4>
			<div class="flex items-center gap-0.5 shrink-0">
				{#each Array(5) as _, i}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4 {i < clip.rating ? 'text-amber-400' : 'text-zinc-700'}"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
						/>
					</svg>
				{/each}
			</div>
		</div>
		<span class="inline-block text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded mb-2"
			>{clip.timestamp}</span
		>
		<p class="text-sm text-zinc-400 mb-2">{clip.description}</p>
		<p class="text-sm text-zinc-300 border-l-2 border-indigo-500 pl-3 italic">{clip.assessment}</p>
	</div>
</div>
