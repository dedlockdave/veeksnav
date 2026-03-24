<script lang="ts">
	import { onMount } from 'svelte';
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
	<div>
		<h1 class="text-3xl font-bold text-white">Export Queue</h1>
		<p class="text-zinc-400 text-sm mt-1">
			Approved videos ready for the post-creation agent
		</p>
	</div>

	{#if loading}
		<div class="text-center py-12 text-zinc-500 animate-pulse">Loading queue…</div>
	{:else if error}
		<div class="text-center py-12 text-red-400">{error}</div>
	{:else if exports.length === 0}
		<div class="text-center py-16">
			<p class="text-zinc-500 text-lg">No exports yet</p>
			<p class="text-zinc-600 text-sm mt-2">
				Approve a video and click "Publish to Queue" to get started
			</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each exports as exp (exp.videoId)}
				<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
					<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
						<div class="min-w-0">
							<div class="flex items-center gap-3 mb-2">
								<h2 class="text-lg font-semibold text-white truncate">
									{exp.title}
								</h2>
								<span
									class="px-2.5 py-0.5 rounded-full border text-xs font-medium shrink-0 {statusColors[
										exp.status
									]}"
								>
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

					<!-- Clips summary -->
					<div class="mt-4 border-t border-zinc-800 pt-4">
						<h3 class="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
							Accepted Clips
						</h3>
						<div class="flex flex-wrap gap-2">
							{#each exp.clips as clip}
								<span
									class="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg"
								>
									{clip.title}
									<span class="text-zinc-500 ml-1">{clip.timestamp}</span>
									{#if clip.wasEdited}
										<span class="text-indigo-400 ml-1">edited</span>
									{/if}
								</span>
							{/each}
						</div>
					</div>

					<!-- Tags -->
					<div class="flex flex-wrap gap-1.5 mt-3">
						{#each exp.tags as tag}
							<span class="text-xs bg-zinc-800/50 text-zinc-500 px-2 py-0.5 rounded-full"
								>{tag}</span
							>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
