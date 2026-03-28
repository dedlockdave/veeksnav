<script lang="ts">
	import { onMount } from 'svelte';
	import { Motion } from 'svelte-motion';
	import ScoreBar from '$lib/components/ScoreBar.svelte';
	import ClipCard from '$lib/components/ClipCard.svelte';
	import PostDraftCard from '$lib/components/PostDraftCard.svelte';
	import AnimateIn from '$lib/components/AnimateIn.svelte';
	import StaggerChildren from '$lib/components/StaggerChildren.svelte';
	import StaggerItem from '$lib/components/StaggerItem.svelte';
	import { loadReview, saveReview, loadReviewFromServer } from '$lib/stores/reviewStore';
	import type { ClipEdit, VideoReviewState } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const video = data.video;

	let currentStatus = $state(video.status);
	let loaded = $state(false);
	let saveIndicator = $state<'idle' | 'saving' | 'saved'>('idle');
	let publishState = $state<'idle' | 'publishing' | 'published' | 'error'>('idle');
	let publishError = $state('');

	let clips = $state(video.clips.map((c) => ({ ...c })));

	let clipStatuses = $state<Record<string, 'pending' | 'accepted' | 'rejected'>>(
		Object.fromEntries(video.clips.map((c) => [c.id, c.status ?? 'pending']))
	);

	let editingClipId = $state<string | null>(null);
	let clipEdits = $state<Record<string, ClipEdit>>({});

	onMount(async () => {
		let saved = loadReview(video.id);
		if (!saved) {
			saved = await loadReviewFromServer(video.id);
		}
		if (saved) {
			currentStatus = saved.videoStatus;
			clipStatuses = { ...clipStatuses, ...saved.clipStatuses };
			clipEdits = saved.clipEdits ?? {};
			if (saved.clipEdits) {
				clips = clips.map((c) => {
					const edit = saved.clipEdits[c.id];
					if (edit) {
						return {
							...c,
							startSeconds: edit.newStart,
							endSeconds: edit.newEnd,
							timestamp: `${String(Math.floor(edit.newStart / 60)).padStart(2, '0')}:${String(edit.newStart % 60).padStart(2, '0')}-${String(Math.floor(edit.newEnd / 60)).padStart(2, '0')}:${String(edit.newEnd % 60).padStart(2, '0')}`
						};
					}
					return c;
				});
			}
		}
		loaded = true;
	});

	function persistState() {
		const state: VideoReviewState = {
			videoId: video.id,
			videoStatus: currentStatus,
			clipStatuses,
			clipEdits,
			updatedAt: new Date().toISOString()
		};
		saveReview(state);
		saveIndicator = 'saving';
		setTimeout(() => {
			saveIndicator = 'saved';
			setTimeout(() => { saveIndicator = 'idle'; }, 1500);
		}, 300);
	}

	function handleClipStatus(clipId: string, status: 'pending' | 'accepted' | 'rejected') {
		clipStatuses = { ...clipStatuses, [clipId]: status };
		persistState();
	}

	function toggleEdit(clipId: string) {
		editingClipId = editingClipId === clipId ? null : clipId;
	}

	function handleEditSave(edit: ClipEdit) {
		clipEdits = { ...clipEdits, [edit.clipId]: edit };
		clips = clips.map((c) => {
			if (c.id === edit.clipId) {
				return {
					...c,
					startSeconds: edit.newStart,
					endSeconds: edit.newEnd,
					timestamp: `${String(Math.floor(edit.newStart / 60)).padStart(2, '0')}:${String(edit.newStart % 60).padStart(2, '0')}-${String(Math.floor(edit.newEnd / 60)).padStart(2, '0')}:${String(edit.newEnd % 60).padStart(2, '0')}`
				};
			}
			return c;
		});
		editingClipId = null;
		persistState();
	}

	function setVideoStatus(status: 'review' | 'approved' | 'rejected' | 'posted') {
		currentStatus = status;
		persistState();
	}

	const acceptedCount = $derived(
		Object.values(clipStatuses).filter((s) => s === 'accepted').length
	);
	const rejectedCount = $derived(
		Object.values(clipStatuses).filter((s) => s === 'rejected').length
	);
	const pendingCount = $derived(Object.values(clipStatuses).filter((s) => s === 'pending').length);
	const allReviewed = $derived(pendingCount === 0);
	const editCount = $derived(Object.keys(clipEdits).length);

	const sortedClips = $derived(() => {
		const order: Record<string, number> = { accepted: 0, pending: 1, rejected: 2 };
		return [...clips].sort((a, b) => {
			const aOrder = order[clipStatuses[a.id] ?? 'pending'] ?? 1;
			const bOrder = order[clipStatuses[b.id] ?? 'pending'] ?? 1;
			return aOrder - bOrder;
		});
	});

	function acceptAll() {
		clipStatuses = Object.fromEntries(clips.map((c) => [c.id, 'accepted' as const]));
		persistState();
	}

	function resetAll() {
		clipStatuses = Object.fromEntries(clips.map((c) => [c.id, 'pending' as const]));
		clipEdits = {};
		persistState();
	}

	function exportEdits() {
		const payload = {
			videoId: video.id,
			videoStatus: currentStatus,
			clipStatuses,
			clipEdits,
			exportedAt: new Date().toISOString()
		};
		const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${video.id}-review.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	async function publishToQueue() {
		publishState = 'publishing';
		publishError = '';
		try {
			const res = await fetch('/api/exports', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ videoId: video.id })
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({ message: 'Unknown error' }));
				throw new Error(err.message ?? `HTTP ${res.status}`);
			}
			publishState = 'published';
		} catch (e: unknown) {
			publishState = 'error';
			publishError = e instanceof Error ? e.message : 'Failed to publish';
		}
	}

	const canPublish = $derived(currentStatus === 'approved' && acceptedCount > 0);

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

<div class="space-y-10">
	<!-- Header with cinematic entrance -->
	<div>
		<Motion
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
			let:motion
		>
			<a
				use:motion
				href="/videos"
				class="text-sm text-zinc-400 hover:text-white transition-colors mb-4 inline-flex items-center gap-1"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
				Back to Reviews
			</a>
		</Motion>

		<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mt-3">
			<div>
				<Motion
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
					let:motion
				>
					<h1 use:motion class="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">{video.title}</h1>
				</Motion>
				<Motion
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
					let:motion
				>
					<div use:motion class="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
						<span class="px-2.5 py-0.5 rounded-full border text-xs font-medium {statusColors[currentStatus]}">
							{currentStatus}
						</span>
						{#if saveIndicator === 'saving'}
							<span class="text-xs text-indigo-400 animate-pulse">Saving…</span>
						{:else if saveIndicator === 'saved'}
							<span class="text-xs text-emerald-400">✓ Saved</span>
						{/if}
						<span>{video.createdAt}</span>
						<span>·</span>
						<span>{video.duration}</span>
						<span>·</span>
						<a href={video.sourceUrl} target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:text-indigo-300 transition-colors">
							YouTube Source ↗
						</a>
					</div>
				</Motion>
				<Motion
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					let:motion
				>
					<div use:motion class="flex flex-wrap gap-1.5 mt-3">
						{#each video.tags as tag}
							<span class="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{tag}</span>
						{/each}
					</div>
				</Motion>
			</div>

			<!-- Action buttons -->
			<Motion
				initial={{ opacity: 0, x: 30 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
				let:motion
			>
				<div use:motion class="flex flex-wrap gap-2 shrink-0">
					<button
						onclick={() => setVideoStatus('approved')}
						class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 {currentStatus === 'approved'
							? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
							: 'bg-zinc-800 text-zinc-300 hover:bg-emerald-600/20 hover:text-emerald-400'}"
					>
						✓ Approve
					</button>
					<button
						onclick={() => setVideoStatus('rejected')}
						class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 {currentStatus === 'rejected'
							? 'bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]'
							: 'bg-zinc-800 text-zinc-300 hover:bg-red-600/20 hover:text-red-400'}"
					>
						✗ Reject
					</button>
					<button
						onclick={() => setVideoStatus('review')}
						class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 {currentStatus === 'review'
							? 'bg-amber-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]'
							: 'bg-zinc-800 text-zinc-300 hover:bg-amber-600/20 hover:text-amber-400'}"
					>
						↻ Revise
					</button>
					{#if canPublish}
						<div class="w-px bg-zinc-700 mx-1"></div>
						<button
							onclick={publishToQueue}
							disabled={publishState === 'publishing' || publishState === 'published'}
							class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300
								{publishState === 'published'
									? 'bg-blue-600 text-white cursor-default'
									: publishState === 'publishing'
										? 'bg-indigo-600/50 text-indigo-300 cursor-wait'
										: 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]'}"
						>
							{#if publishState === 'publishing'}
								Publishing…
							{:else if publishState === 'published'}
								✓ Queued
							{:else}
								Publish to Queue
							{/if}
						</button>
					{/if}
					{#if publishState === 'error'}
						<span class="text-xs text-red-400 self-center">{publishError}</span>
					{/if}
				</div>
			</Motion>
		</div>
	</div>

	<!-- Animated divider -->
	<Motion
		initial={{ scaleX: 0 }}
		animate={{ scaleX: 1 }}
		transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
		let:motion
	>
		<div use:motion class="h-px bg-gradient-to-r from-indigo-500/40 via-violet-500/20 to-transparent origin-left"></div>
	</Motion>

	<!-- Loading indicator -->
	{#if !loaded}
		<div class="text-center py-4 text-zinc-500 text-sm animate-pulse">
			Loading saved review state…
		</div>
	{/if}

	<!-- Incident Summary — storybook chapter 1 -->
	<AnimateIn y={50} duration={0.8}>
		<section class="bg-zinc-900/80 rounded-2xl border border-zinc-800/60 p-6 backdrop-blur-sm">
			<div class="flex items-center gap-3 mb-4">
				<div class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">1</div>
				<h2 class="text-lg font-semibold text-white">Incident Summary</h2>
			</div>
			<p class="text-zinc-300 leading-relaxed">{video.analysis.summary}</p>
		</section>
	</AnimateIn>

	<!-- Officer Scorecard — storybook chapter 2, bars animate on scroll -->
	<AnimateIn y={50} delay={0.1} duration={0.8}>
		<section class="bg-zinc-900/80 rounded-2xl border border-zinc-800/60 p-6 backdrop-blur-sm">
			<div class="flex items-center gap-3 mb-5">
				<div class="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 text-sm font-bold">2</div>
				<h2 class="text-lg font-semibold text-white">Officer Conduct Scorecard</h2>
			</div>
			<div class="space-y-3">
				<ScoreBar label="Communication" score={video.analysis.scorecard.communication} />
				<ScoreBar label="De-escalation" score={video.analysis.scorecard.deescalation} />
				<ScoreBar label="Use of Force" score={video.analysis.scorecard.useOfForce} />
				<ScoreBar label="Legal Knowledge" score={video.analysis.scorecard.legalKnowledge} />
				<ScoreBar label="Bodycam Compliance" score={video.analysis.scorecard.bodycamCompliance} />
				<div class="border-t border-zinc-700/50 pt-3 mt-3">
					<ScoreBar label="Overall" score={video.analysis.scorecard.overall} />
				</div>
			</div>
		</section>
	</AnimateIn>

	<!-- Extracted Clips — storybook chapter 3 -->
	<AnimateIn y={50} delay={0.1} duration={0.8}>
		<section>
			<div class="flex items-center gap-3 mb-2">
				<div class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">3</div>
				<h2 class="text-lg font-semibold text-white">Extracted Clips ({clips.length})</h2>
			</div>
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
				<p class="text-sm text-zinc-400">
					{#if allReviewed}
						All clips reviewed —
						<span class="text-emerald-400">{acceptedCount} accepted</span>,
						<span class="text-red-400">{rejectedCount} skipped</span>
					{:else}
						<span class="text-emerald-400">{acceptedCount} accepted</span> ·
						<span class="text-red-400">{rejectedCount} skipped</span> ·
						<span class="text-amber-400">{pendingCount} pending</span>
					{/if}
					{#if editCount > 0}
						· <span class="text-indigo-400">{editCount} edited</span>
					{/if}
				</p>
				<div class="flex gap-2 shrink-0">
					{#if editCount > 0}
						<button
							onclick={exportEdits}
							class="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
						>
							Export Edits
						</button>
					{/if}
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
			<StaggerChildren stagger={0.1} delayStart={0.2} class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{#each sortedClips() as clip (clip.id)}
					<StaggerItem y={30} scale={0.95}>
						<ClipCard
							{clip}
							status={clipStatuses[clip.id]}
							editing={editingClipId === clip.id}
							sourceVideoUrl={video.sourceVideoUrl ?? ''}
							videoDuration={video.durationSeconds ?? 900}
							onStatusChange={handleClipStatus}
							onEdit={toggleEdit}
							onEditSave={handleEditSave}
						/>
					</StaggerItem>
				{/each}
			</StaggerChildren>
		</section>
	</AnimateIn>

	<!-- Teachable Moments — storybook chapter 4 -->
	<AnimateIn y={50} delay={0.1} duration={0.8}>
		<section>
			<div class="flex items-center gap-3 mb-5">
				<div class="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-bold">4</div>
				<h2 class="text-lg font-semibold text-white">Teachable Moments</h2>
			</div>
			<div class="space-y-3">
				{#each video.analysis.teachableMoments as moment, i}
					<AnimateIn y={20} delay={0.05 * i} duration={0.5}>
						<div class="bg-zinc-900/80 rounded-xl border border-zinc-800/60 overflow-hidden backdrop-blur-sm">
							<button
								onclick={() => toggleMoment(i)}
								class="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/50 transition-colors"
							>
								<span class="font-medium text-white">{moment.title}</span>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5 text-zinc-400 transition-transform duration-300 {expandedMoments[i] ? 'rotate-180' : ''}"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
								</svg>
							</button>
							{#if expandedMoments[i]}
								<div class="px-4 pb-4">
									<p class="text-sm text-zinc-300 leading-relaxed">{moment.content}</p>
								</div>
							{/if}
						</div>
					</AnimateIn>
				{/each}
			</div>
		</section>
	</AnimateIn>

	<!-- Draft Posts — storybook chapter 5 -->
	<AnimateIn y={50} delay={0.1} duration={0.8}>
		<section>
			<div class="flex items-center gap-3 mb-5">
				<div class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">5</div>
				<h2 class="text-lg font-semibold text-white">Draft Posts</h2>
			</div>
			<StaggerChildren stagger={0.15} class="grid grid-cols-1 md:grid-cols-3 gap-4">
				{#each video.analysis.postDrafts as draft (draft.id)}
					<StaggerItem y={30} scale={0.95}>
						<PostDraftCard {draft} />
					</StaggerItem>
				{/each}
			</StaggerChildren>
		</section>
	</AnimateIn>
</div>
