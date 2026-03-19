<script lang="ts">
	import ScoreBar from '$lib/components/ScoreBar.svelte';
	import ClipCard from '$lib/components/ClipCard.svelte';
	import PostDraftCard from '$lib/components/PostDraftCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const video = data.video;

	let currentStatus = $state(video.status);

	// Per-clip status tracking
	let clipStatuses = $state<Record<string, 'pending' | 'accepted' | 'rejected'>>(
		Object.fromEntries(video.clips.map((c) => [c.id, c.status ?? 'pending']))
	);

	function handleClipStatus(clipId: string, status: 'pending' | 'accepted' | 'rejected') {
		clipStatuses = { ...clipStatuses, [clipId]: status };
	}

	const acceptedCount = $derived(Object.values(clipStatuses).filter((s) => s === 'accepted').length);
	const rejectedCount = $derived(Object.values(clipStatuses).filter((s) => s === 'rejected').length);
	const pendingCount = $derived(Object.values(clipStatuses).filter((s) => s === 'pending').length);
	const allReviewed = $derived(pendingCount === 0);

	function acceptAll() {
		clipStatuses = Object.fromEntries(video.clips.map((c) => [c.id, 'accepted' as const]));
	}

	function resetAll() {
		clipStatuses = Object.fromEntries(video.clips.map((c) => [c.id, 'pending' as const]));
	}

	const statusColors: Record<string, string> = {
		review: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
		approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
		rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
		posted: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
	};

	let expandedMoments = $state<Record<number, boolean>>({});

	function toggleMoment(index: number) {
		expandedMoments = { ...expandedMoments, [index]: !expandedMoments[index] };
	}
</script>

<svelte:head>
	<title>{video.title} — VeeksNav</title>
</svelte:head>

<div class="space-y-8">
	<!-- Header -->
	<div>
		<a
			href="/videos"
			class="text-sm text-zinc-400 hover:text-white transition-colors mb-4 inline-flex items-center gap-1"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M15 19l-7-7 7-7"
				/>
			</svg>
			Back to Reviews
		</a>

		<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mt-3">
			<div>
				<h1 class="text-3xl font-bold text-white mb-2">{video.title}</h1>
				<div class="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
					<span
						class="px-2.5 py-0.5 rounded-full border text-xs font-medium {statusColors[
							currentStatus
						]}"
					>
						{currentStatus}
					</span>
					<span>{video.createdAt}</span>
					<span>·</span>
					<span>{video.duration}</span>
					<span>·</span>
					<a
						href={video.sourceUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="text-indigo-400 hover:text-indigo-300 transition-colors"
					>
						YouTube Source ↗
					</a>
				</div>
				<div class="flex flex-wrap gap-1.5 mt-3">
					{#each video.tags as tag}
						<span class="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{tag}</span>
					{/each}
				</div>
			</div>

			<!-- Video-level Action Buttons -->
			<div class="flex gap-2 shrink-0">
				<button
					onclick={() => (currentStatus = 'approved')}
					class="px-4 py-2 text-sm font-medium rounded-lg transition-colors {currentStatus ===
					'approved'
						? 'bg-emerald-600 text-white'
						: 'bg-zinc-800 text-zinc-300 hover:bg-emerald-600/20 hover:text-emerald-400'}"
				>
					✓ Approve
				</button>
				<button
					onclick={() => (currentStatus = 'rejected')}
					class="px-4 py-2 text-sm font-medium rounded-lg transition-colors {currentStatus ===
					'rejected'
						? 'bg-red-600 text-white'
						: 'bg-zinc-800 text-zinc-300 hover:bg-red-600/20 hover:text-red-400'}"
				>
					✗ Reject
				</button>
				<button
					onclick={() => (currentStatus = 'review')}
					class="px-4 py-2 text-sm font-medium rounded-lg transition-colors {currentStatus ===
					'review'
						? 'bg-amber-600 text-white'
						: 'bg-zinc-800 text-zinc-300 hover:bg-amber-600/20 hover:text-amber-400'}"
				>
					↻ Revise
				</button>
			</div>
		</div>
	</div>

	<!-- Incident Summary -->
	<section class="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
		<h2 class="text-lg font-semibold text-white mb-3">Incident Summary</h2>
		<p class="text-zinc-300 leading-relaxed">{video.analysis.summary}</p>
	</section>

	<!-- Officer Scorecard -->
	<section class="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
		<h2 class="text-lg font-semibold text-white mb-4">Officer Conduct Scorecard</h2>
		<div class="space-y-3">
			<ScoreBar label="Communication" score={video.analysis.scorecard.communication} />
			<ScoreBar label="De-escalation" score={video.analysis.scorecard.deescalation} />
			<ScoreBar label="Use of Force" score={video.analysis.scorecard.useOfForce} />
			<ScoreBar label="Legal Knowledge" score={video.analysis.scorecard.legalKnowledge} />
			<ScoreBar label="Bodycam Compliance" score={video.analysis.scorecard.bodycamCompliance} />
			<div class="border-t border-zinc-700 pt-3 mt-3">
				<ScoreBar label="Overall" score={video.analysis.scorecard.overall} />
			</div>
		</div>
	</section>

	<!-- Clips with per-clip controls -->
	<section>
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
			<div>
				<h2 class="text-lg font-semibold text-white">
					Extracted Clips ({video.clips.length})
				</h2>
				<p class="text-sm text-zinc-400 mt-1">
					{#if allReviewed}
						All clips reviewed —
						<span class="text-emerald-400">{acceptedCount} accepted</span>,
						<span class="text-red-400">{rejectedCount} skipped</span>
					{:else}
						<span class="text-emerald-400">{acceptedCount} accepted</span> ·
						<span class="text-red-400">{rejectedCount} skipped</span> ·
						<span class="text-amber-400">{pendingCount} pending</span>
					{/if}
				</p>
			</div>
			<div class="flex gap-2 shrink-0">
				<button
					onclick={acceptAll}
					class="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 text-zinc-400 hover:bg-emerald-600/20 hover:text-emerald-400 transition-colors"
				>
					Accept All
				</button>
				<button
					onclick={resetAll}
					class="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300 transition-colors"
				>
					Reset
				</button>
			</div>
		</div>
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{#each video.clips as clip (clip.id)}
				<ClipCard {clip} status={clipStatuses[clip.id]} onStatusChange={handleClipStatus} />
			{/each}
		</div>
	</section>

	<!-- Teachable Moments -->
	<section>
		<h2 class="text-lg font-semibold text-white mb-4">Teachable Moments</h2>
		<div class="space-y-3">
			{#each video.analysis.teachableMoments as moment, i}
				<div class="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
					<button
						onclick={() => toggleMoment(i)}
						class="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/50 transition-colors"
					>
						<span class="font-medium text-white">{moment.title}</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 text-zinc-400 transition-transform {expandedMoments[i]
								? 'rotate-180'
								: ''}"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
					{#if expandedMoments[i]}
						<div class="px-4 pb-4">
							<p class="text-sm text-zinc-300 leading-relaxed">{moment.content}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</section>

	<!-- Draft Posts -->
	<section>
		<h2 class="text-lg font-semibold text-white mb-4">Draft Posts</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			{#each video.analysis.postDrafts as draft (draft.id)}
				<PostDraftCard {draft} />
			{/each}
		</div>
	</section>
</div>
