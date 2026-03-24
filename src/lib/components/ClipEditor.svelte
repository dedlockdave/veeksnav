<script lang="ts">
	import type { Clip, ClipEdit } from '$lib/types';

	const CONTEXT_SECONDS = 3; // seconds of context before/after boundary

	let {
		clip,
		sourceVideoUrl,
		videoDuration = 900,
		onSave,
		onCancel
	}: {
		clip: Clip;
		sourceVideoUrl: string;
		videoDuration?: number;
		onSave?: (edit: ClipEdit) => void;
		onCancel?: () => void;
	} = $props();

	let videoEl = $state<HTMLVideoElement | null>(null);
	let timelineEl = $state<HTMLDivElement | null>(null);
	let newStart = $state(clip.startSeconds);
	let newEnd = $state(clip.endSeconds);
	let notes = $state('');
	let isPlaying = $state(false);
	let currentTime = $state(clip.startSeconds);
	let playbackRate = $state(1);
	let fullscreen = $state(false);

	// Drag state
	let dragging = $state<'start' | 'end' | null>(null);

	// Preview mode: which boundary/range we're previewing
	let previewMode = $state<'full' | 'start' | 'end' | null>(null);
	let previewStopAt = $state<number | null>(null);

	const clipDuration = $derived(newEnd - newStart);
	const hasChanges = $derived(newStart !== clip.startSeconds || newEnd !== clip.endSeconds);

	function fmtTime(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	}

	function fmtTimePrecise(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m.toString().padStart(2, '0')}:${s.toFixed(1).padStart(4, '0')}`;
	}

	function parseTime(str: string): number | null {
		const parts = str.split(':');
		if (parts.length === 2) {
			const m = parseInt(parts[0]);
			const s = parseInt(parts[1]);
			if (!isNaN(m) && !isNaN(s)) return m * 60 + s;
		}
		return null;
	}

	function adjustStart(delta: number) {
		newStart = Math.max(0, Math.min(newEnd - 1, newStart + delta));
	}

	function adjustEnd(delta: number) {
		newEnd = Math.max(newStart + 1, Math.min(videoDuration, newEnd + delta));
	}

	function handleStartInput(e: Event) {
		const val = parseTime((e.target as HTMLInputElement).value);
		if (val !== null && val < newEnd && val >= 0) newStart = val;
	}

	function handleEndInput(e: Event) {
		const val = parseTime((e.target as HTMLInputElement).value);
		if (val !== null && val > newStart && val <= videoDuration) newEnd = val;
	}

	// --- Timeline interaction ---

	function timeFromMouseEvent(e: MouseEvent): number {
		if (!timelineEl) return 0;
		const rect = timelineEl.getBoundingClientRect();
		const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
		return pct * videoDuration;
	}

	function handleTimelineClick(e: MouseEvent) {
		if (dragging) return;
		const time = timeFromMouseEvent(e);
		seekTo(time);
	}

	function handleDragStart(handle: 'start' | 'end', e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		dragging = handle;

		function onMouseMove(e: MouseEvent) {
			const time = timeFromMouseEvent(e);
			if (handle === 'start') {
				newStart = Math.max(0, Math.min(newEnd - 1, Math.round(time)));
			} else {
				newEnd = Math.max(newStart + 1, Math.min(videoDuration, Math.round(time)));
			}
		}

		function onMouseUp() {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
			requestAnimationFrame(() => {
				dragging = null;
			});
		}

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
	}

	// --- Preview functions ---

	function previewFull() {
		if (!videoEl) return;
		videoEl.currentTime = newStart;
		previewMode = 'full';
		previewStopAt = newEnd;
		videoEl.play();
	}

	function previewStart() {
		if (!videoEl) return;
		const from = Math.max(0, newStart - CONTEXT_SECONDS);
		const to = newStart + CONTEXT_SECONDS;
		videoEl.currentTime = from;
		previewMode = 'start';
		previewStopAt = to;
		videoEl.play();
	}

	function previewEnd() {
		if (!videoEl) return;
		const from = Math.max(0, newEnd - CONTEXT_SECONDS);
		const to = Math.min(videoDuration, newEnd + CONTEXT_SECONDS);
		videoEl.currentTime = from;
		previewMode = 'end';
		previewStopAt = to;
		videoEl.play();
	}

	function stopPreview() {
		if (!videoEl) return;
		videoEl.pause();
		previewMode = null;
		previewStopAt = null;
		isPlaying = false;
	}

	function handleTimeUpdate() {
		if (!videoEl) return;
		currentTime = videoEl.currentTime;
		if (previewStopAt !== null && videoEl.currentTime >= previewStopAt) {
			stopPreview();
		}
	}

	function togglePlay() {
		if (!videoEl) return;
		if (videoEl.paused) {
			// Play from current position, stop at clip end
			if (!previewMode) {
				previewMode = 'full';
				previewStopAt = newEnd;
			}
			videoEl.play();
			isPlaying = true;
		} else {
			stopPreview();
		}
	}

	function seekTo(time: number) {
		if (!videoEl) return;
		stopPreview();
		videoEl.currentTime = time;
		currentTime = time;
	}

	function seekToStart() {
		seekTo(newStart);
	}

	function seekToEnd() {
		seekTo(newEnd);
	}

	function skip(delta: number) {
		if (!videoEl) return;
		const newTime = Math.max(0, Math.min(videoDuration, videoEl.currentTime + delta));
		videoEl.currentTime = newTime;
		currentTime = newTime;
	}

	function stepFrame(direction: 1 | -1) {
		if (!videoEl) return;
		videoEl.pause();
		isPlaying = false;
		previewMode = null;
		previewStopAt = null;
		const newTime = Math.max(0, Math.min(videoDuration, videoEl.currentTime + direction * (1 / 30)));
		videoEl.currentTime = newTime;
		currentTime = newTime;
	}

	function cycleSpeed() {
		const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
		const idx = speeds.indexOf(playbackRate);
		playbackRate = speeds[(idx + 1) % speeds.length];
		if (videoEl) videoEl.playbackRate = playbackRate;
	}

	function toggleFullscreen() {
		fullscreen = !fullscreen;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && fullscreen) {
			fullscreen = false;
			e.preventDefault();
		}
	}

	function setStartFromPlayhead() {
		if (currentTime < newEnd) newStart = Math.floor(currentTime);
	}

	function setEndFromPlayhead() {
		if (currentTime > newStart) newEnd = Math.ceil(currentTime);
	}

	function resetToOriginal() {
		newStart = clip.startSeconds;
		newEnd = clip.endSeconds;
		notes = '';
	}

	function handleSave() {
		onSave?.({
			clipId: clip.id,
			originalStart: clip.startSeconds,
			originalEnd: clip.endSeconds,
			newStart,
			newEnd,
			notes,
			submitted: true
		});
	}

	// Seek video to clip start on mount
	$effect(() => {
		if (videoEl) {
			videoEl.currentTime = clip.startSeconds;
		}
	});

	// Keep previewStopAt in sync when dragging end handle during full clip playback
	$effect(() => {
		if (previewMode === 'full') {
			previewStopAt = newEnd;
		}
	});

	// Range slider position calculations
	const rangeStartPct = $derived((newStart / videoDuration) * 100);
	const rangeEndPct = $derived((newEnd / videoDuration) * 100);
	const rangeWidthPct = $derived(rangeEndPct - rangeStartPct);
	const playheadPct = $derived((currentTime / videoDuration) * 100);

	// Preview mode label
	const previewLabel = $derived(
		previewMode === 'start'
			? 'Previewing start boundary...'
			: previewMode === 'end'
				? 'Previewing end boundary...'
				: previewMode === 'full'
					? 'Previewing full clip...'
					: null
	);
</script>

<svelte:window onkeydown={handleKeydown} />

{#if fullscreen}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 bg-black/90 z-50 backdrop-blur-sm"
		onclick={(e) => { if (e.target === e.currentTarget) fullscreen = false; }}
	></div>
{/if}

<div
	class="{fullscreen
		? 'fixed inset-0 z-50 flex flex-col bg-zinc-950'
		: 'bg-zinc-950 rounded-xl border border-indigo-500/40'} p-4 space-y-4"
>
	<div class="flex items-center justify-between">
		<h4 class="text-sm font-semibold text-indigo-400">Clip Editor</h4>
		<div class="flex items-center gap-2">
			<button
				onclick={toggleFullscreen}
				class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
				title={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
			>
				{#if fullscreen}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 9L4 4m0 0v4m0-4h4m7 5l5-5m0 0v4m0-4h-4M9 15l-5 5m0 0v-4m0 4h4m7-5l5 5m0 0v-4m0 4h-4" />
					</svg>
					Exit Fullscreen
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 0l-5 5" />
					</svg>
					Fullscreen
				{/if}
			</button>
			<button onclick={onCancel} class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
				Close
			</button>
		</div>
	</div>

	<!-- Source video player -->
	<div class="{fullscreen ? 'flex-1 min-h-0' : 'aspect-video'} bg-black rounded-lg overflow-hidden relative">
		<video
			bind:this={videoEl}
			ontimeupdate={handleTimeUpdate}
			onplay={() => (isPlaying = true)}
			onpause={() => { isPlaying = false; }}
			preload="metadata"
			class="w-full h-full object-contain"
		>
			<source src={sourceVideoUrl} type="video/mp4" />
			<track kind="captions" />
		</video>
		<!-- Playhead time overlay -->
		<div
			class="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-mono px-2 py-1 rounded"
		>
			{fmtTimePrecise(currentTime)}
		</div>
		<!-- Speed indicator -->
		{#if playbackRate !== 1}
			<div
				class="absolute bottom-2 right-2 bg-black/70 text-amber-400 text-xs font-mono px-2 py-1 rounded"
			>
				{playbackRate}x
			</div>
		{/if}
		<!-- Preview mode indicator -->
		{#if previewLabel}
			<div
				class="absolute top-2 left-1/2 -translate-x-1/2 bg-indigo-600/90 text-white text-xs font-medium px-3 py-1 rounded-full"
			>
				{previewLabel}
			</div>
		{/if}
	</div>

	<!-- Controls wrapper — constrained width in fullscreen -->
	<div class="{fullscreen ? 'max-w-5xl mx-auto w-full space-y-4 shrink-0 overflow-y-auto' : 'contents'}">

	<!-- Timeline range bar — draggable handles + click to seek -->
	<div class="space-y-1">
		<div class="text-xs text-zinc-500 flex justify-between">
			<span>{fmtTime(0)}</span>
			<span class="text-zinc-400 font-mono">{fmtTimePrecise(currentTime)}</span>
			<span>{fmtTime(videoDuration)}</span>
		</div>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			bind:this={timelineEl}
			onclick={handleTimelineClick}
			class="relative h-10 bg-zinc-800 rounded-lg overflow-visible cursor-pointer group"
		>
			<!-- Original range ghost -->
			<div
				class="absolute top-0 h-full border-x border-dashed border-zinc-600 opacity-30 pointer-events-none"
				style="left: {(clip.startSeconds / videoDuration) * 100}%; width: {((clip.endSeconds - clip.startSeconds) / videoDuration) * 100}%"
			></div>
			<!-- Selected range highlight -->
			<div
				class="absolute top-0 h-full bg-indigo-500/25 pointer-events-none"
				style="left: {rangeStartPct}%; width: {rangeWidthPct}%"
			></div>

			<!-- Start handle -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				onmousedown={(e) => handleDragStart('start', e)}
				class="absolute top-0 h-full w-3 cursor-col-resize z-20 flex items-center justify-center group/handle"
				style="left: {rangeStartPct}%; transform: translateX(-50%)"
			>
				<div
					class="w-1 h-full rounded-full transition-colors
					{dragging === 'start' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-emerald-500 group-hover/handle:bg-emerald-400'}"
				></div>
				<div
					class="absolute -bottom-5 text-[10px] font-mono whitespace-nowrap transition-opacity
					{dragging === 'start' ? 'text-emerald-400 opacity-100' : 'text-zinc-500 opacity-0 group-hover/handle:opacity-100'}"
				>
					{fmtTime(newStart)}
				</div>
			</div>

			<!-- End handle -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				onmousedown={(e) => handleDragStart('end', e)}
				class="absolute top-0 h-full w-3 cursor-col-resize z-20 flex items-center justify-center group/handle"
				style="left: {rangeEndPct}%; transform: translateX(-50%)"
			>
				<div
					class="w-1 h-full rounded-full transition-colors
					{dragging === 'end' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-amber-500 group-hover/handle:bg-amber-400'}"
				></div>
				<div
					class="absolute -bottom-5 text-[10px] font-mono whitespace-nowrap transition-opacity
					{dragging === 'end' ? 'text-amber-400 opacity-100' : 'text-zinc-500 opacity-0 group-hover/handle:opacity-100'}"
				>
					{fmtTime(newEnd)}
				</div>
			</div>

			<!-- Playhead -->
			<div
				class="absolute top-0 h-full w-0.5 bg-white z-10 pointer-events-none"
				style="left: {playheadPct}%"
			>
				<div class="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-white"></div>
			</div>
		</div>
		<div class="h-3"></div>
	</div>

	<!-- Transport controls -->
	<div class="flex items-center justify-center gap-1">
		<button
			onclick={seekToStart}
			class="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors"
			title="Go to clip start"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
				<path d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" />
			</svg>
		</button>
		<button
			onclick={() => skip(-5)}
			class="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
			title="Back 5s"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
			</svg>
		</button>
		<button
			onclick={() => stepFrame(-1)}
			class="p-1.5 rounded-lg bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
			title="Previous frame"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
			</svg>
		</button>
		<button
			onclick={togglePlay}
			class="p-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
		>
			{#if isPlaying}
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
				</svg>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
				</svg>
			{/if}
		</button>
		<button
			onclick={() => stepFrame(1)}
			class="p-1.5 rounded-lg bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
			title="Next frame"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
			</svg>
		</button>
		<button
			onclick={() => skip(5)}
			class="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
			title="Forward 5s"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
			</svg>
		</button>
		<button
			onclick={seekToEnd}
			class="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors"
			title="Go to clip end"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
				<path d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0zm6 0a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" />
			</svg>
		</button>
		<button
			onclick={cycleSpeed}
			class="ml-2 px-2 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors
				{playbackRate !== 1 ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-zinc-400 hover:text-white'}"
			title="Playback speed"
		>
			{playbackRate}x
		</button>
	</div>

	<!-- Preview buttons -->
	<div class="grid grid-cols-3 gap-2">
		<button
			onclick={previewStart}
			class="px-3 py-2 rounded-lg text-xs font-medium transition-colors
				{previewMode === 'start'
				? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
				: 'bg-zinc-800 text-zinc-400 hover:bg-emerald-600/10 hover:text-emerald-400'}"
		>
			Preview Start
			<span class="block text-[10px] opacity-60 mt-0.5">
				{fmtTime(Math.max(0, newStart - CONTEXT_SECONDS))} - {fmtTime(newStart + CONTEXT_SECONDS)}
			</span>
		</button>
		<button
			onclick={previewFull}
			class="px-3 py-2 rounded-lg text-xs font-medium transition-colors
				{previewMode === 'full'
				? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/40'
				: 'bg-zinc-800 text-zinc-400 hover:bg-indigo-600/10 hover:text-indigo-400'}"
		>
			Full Clip
			<span class="block text-[10px] opacity-60 mt-0.5">
				{fmtTime(newStart)} - {fmtTime(newEnd)}
			</span>
		</button>
		<button
			onclick={previewEnd}
			class="px-3 py-2 rounded-lg text-xs font-medium transition-colors
				{previewMode === 'end'
				? 'bg-amber-600/30 text-amber-400 border border-amber-500/40'
				: 'bg-zinc-800 text-zinc-400 hover:bg-amber-600/10 hover:text-amber-400'}"
		>
			Preview End
			<span class="block text-[10px] opacity-60 mt-0.5">
				{fmtTime(Math.max(0, newEnd - CONTEXT_SECONDS))} - {fmtTime(Math.min(videoDuration, newEnd + CONTEXT_SECONDS))}
			</span>
		</button>
	</div>

	<!-- Set from playhead buttons -->
	<div class="flex gap-2">
		<button
			onclick={setStartFromPlayhead}
			class="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-600/10 transition-colors"
		>
			Set Start @ {fmtTimePrecise(currentTime)}
		</button>
		<button
			onclick={setEndFromPlayhead}
			class="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 text-zinc-400 hover:text-amber-400 hover:bg-amber-600/10 transition-colors"
		>
			Set End @ {fmtTimePrecise(currentTime)}
		</button>
	</div>

	<!-- Timestamp controls -->
	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="clip-start-input" class="text-xs text-zinc-500 mb-1 block">Start</label>
			<div class="flex items-center gap-1">
				<button
					onclick={() => adjustStart(-5)}
					class="px-1.5 py-1 text-xs rounded bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
				>
					-5s
				</button>
				<button
					onclick={() => adjustStart(-2)}
					class="px-1.5 py-1 text-xs rounded bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
				>
					-2s
				</button>
				<input
					id="clip-start-input"
					type="text"
					value={fmtTime(newStart)}
					onchange={handleStartInput}
					class="flex-1 min-w-0 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-white text-center font-mono focus:border-indigo-500 focus:outline-none"
				/>
				<button
					onclick={() => adjustStart(2)}
					class="px-1.5 py-1 text-xs rounded bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
				>
					+2s
				</button>
				<button
					onclick={() => adjustStart(5)}
					class="px-1.5 py-1 text-xs rounded bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
				>
					+5s
				</button>
			</div>
		</div>
		<div>
			<label for="clip-end-input" class="text-xs text-zinc-500 mb-1 block">End</label>
			<div class="flex items-center gap-1">
				<button
					onclick={() => adjustEnd(-5)}
					class="px-1.5 py-1 text-xs rounded bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
				>
					-5s
				</button>
				<button
					onclick={() => adjustEnd(-2)}
					class="px-1.5 py-1 text-xs rounded bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
				>
					-2s
				</button>
				<input
					id="clip-end-input"
					type="text"
					value={fmtTime(newEnd)}
					onchange={handleEndInput}
					class="flex-1 min-w-0 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-white text-center font-mono focus:border-indigo-500 focus:outline-none"
				/>
				<button
					onclick={() => adjustEnd(2)}
					class="px-1.5 py-1 text-xs rounded bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
				>
					+2s
				</button>
				<button
					onclick={() => adjustEnd(5)}
					class="px-1.5 py-1 text-xs rounded bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
				>
					+5s
				</button>
			</div>
		</div>
	</div>

	<!-- Duration + change indicator -->
	<div class="flex items-center justify-between text-xs">
		<span class="text-zinc-500">
			Duration: <span class="text-white font-mono">{fmtTime(clipDuration)}</span>
			{#if hasChanges}
				<span class="text-amber-400 ml-2">
					(was {fmtTime(clip.endSeconds - clip.startSeconds)})
				</span>
			{/if}
		</span>
		{#if hasChanges}
			<button
				onclick={resetToOriginal}
				class="text-zinc-500 hover:text-white transition-colors"
			>
				Reset to original
			</button>
		{/if}
	</div>

	<!-- Notes -->
	<div>
		<label for="clip-notes" class="text-xs text-zinc-500 mb-1 block">Notes (optional)</label>
		<textarea
			id="clip-notes"
			bind:value={notes}
			placeholder="e.g. 'Include the verbal command before the force' or 'Trim the dead air at the start'"
			rows="2"
			class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 resize-none focus:border-indigo-500 focus:outline-none"
		></textarea>
	</div>

	<!-- Actions -->
	<div class="flex gap-2">
		<button
			onclick={handleSave}
			disabled={!hasChanges && !notes}
			class="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors
				{hasChanges || notes
				? 'bg-indigo-600 text-white hover:bg-indigo-500'
				: 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}"
		>
			Save Edit
		</button>
		<button
			onclick={onCancel}
			class="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
		>
			Cancel
		</button>
	</div>

	</div><!-- end controls wrapper -->
</div>
