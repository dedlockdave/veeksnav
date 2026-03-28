<script lang="ts">
	import { onMount } from 'svelte';
	import { Motion } from 'svelte-motion';
	import AnimateIn from '$lib/components/AnimateIn.svelte';
	import StaggerChildren from '$lib/components/StaggerChildren.svelte';
	import StaggerItem from '$lib/components/StaggerItem.svelte';
	import type { VideoExport } from '$lib/types';

	let exports = $state<VideoExport[]>([]);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		try {
			const res = await fetch('/api/exports');
			if (!res.ok) throw new Error('Failed to load');
			exports = await res.json();
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to load exports';
		} finally {
			loading = false;
		}
	});

	const statusColors: Record<string, string> = {
		queued: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
		processing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
		posted: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
		failed: 'bg-red-500/20 text-red-400 border-red-500/30'
	};

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Export Queue — VeeksNav</title>
</svelte:head>

<div class="space-y-6">
	<div class="mb-10">
		<Motion
			initial={{ opacity: 0, x: -40 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
			let:motion
		>
			<h1 use:motion class="text-4xl font-black tracking-tight text-white">Export Queue</h1>
		</Motion>
		<Motion
			initial={{ opacity: 0, x: -30 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
			let:motion
		>
			<p use:motion class="text-zinc-400 text-sm mt-2">
				Approved videos ready for the post-creation agent
			</p>
		</Motion>
		<Motion
			initial={{ scaleX: 0 }}
			animate={{ scaleX: 1 }}
			transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
			let:motion
		>
			<div use:motion class="h-px bg-gradient-to-r from-indigo-500/50 via-violet-500/30 to-transparent mt-6 origin-left"></div>
		</Motion>
	</div>

	{#if loading}
		<div class="text-center py-12 text-zinc-500 animate-pulse">Loading queue…</div>
	{:else if error}
		<div class="text-center py-12 text-red-400">{error}</div>
	{:else if exports.length === 0}
		<AnimateIn y={30} duration={0.6}>
			<div class="text-center py-16">
				<p class="text-zinc-500 text-lg">No exports yet</p>
				<p class="text-zinc-600 text-sm mt-2">
					Approve a video and click "Publish to Queue" to get started
				</p>
			</div>
		</AnimateIn>
	{:else}
		<StaggerChildren stagger={0.12} class="space-y-4">
			{#each exports as exp (exp.videoId)}
				<StaggerItem y={30} scale={0.98}>
					<div class="bg-zinc-900/80 rounded-2xl border border-zinc-800/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/60">
						<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
							<div class="min-w-0">
								<div class="flex items-center gap-3 mb-2">
									<h2 class="text-lg font-semibold text-white truncate">{exp.title}</h2>
									<span class="px-2.5 py-0.5 rounded-full border text-xs font-medium shrink-0 {statusColors[exp.status]}">
										{exp.status}
									</span>
								</div>
								<p class="text-sm text-zinc-400 line-clamp-2">{exp.summary}</p>
								<div class="flex flex-wrap gap-3 mt-3 text-xs text-zinc-500">
									<span>{exp.clips.length} clip{exp.clips.length !== 1 ? 's' : ''}</span>
									<span>·</span>
									<span>{exp.postDrafts.length} draft{exp.postDrafts.length !== 1 ? 's' : ''}</span>
									<span>·</span>
									<span>Published {formatDate(exp.publishedAt)}</span>
									{#if exp.updatedAt !== exp.publishedAt}
										<span>·</span>
										<span>Updated {formatDate(exp.updatedAt)}</span>
									{/if}
								</div>
							</div>
							<div class="flex gap-2 shrink-0">
								<a
									href="/videos/{exp.videoId}"
									class="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300 transition-colors"
								>
									View Review
								</a>
							</div>
						</div>

						<div class="mt-4 border-t border-zinc-800/60 pt-4">
							<h3 class="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Accepted Clips</h3>
							<div class="flex flex-wrap gap-2">
								{#each exp.clips as clip}
									<span class="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg">
										{clip.title}
										<span class="text-zinc-500 ml-1">{clip.timestamp}</span>
										{#if clip.wasEdited}
											<span class="text-indigo-400 ml-1">edited</span>
										{/if}
									</span>
								{/each}
							</div>
						</div>

						<div class="flex flex-wrap gap-1.5 mt-3">
							{#each exp.tags as tag}
								<span class="text-xs bg-zinc-800/50 text-zinc-500 px-2 py-0.5 rounded-full">{tag}</span>
							{/each}
						</div>
					</div>
				</StaggerItem>
			{/each}
		</StaggerChildren>
	{/if}
</div>
