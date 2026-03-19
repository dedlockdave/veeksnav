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
	let newStart = $state(clip.startSeconds);
	let newEnd = $state(clip.endSeconds);
	let notes = $state('');
	let isPlaying = $state(false);
	let currentTime = $state(clip.startSeconds);

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

	// --- Preview functions ---

	/** Preview full clip from start to end */
	function previewFull() {
		if (!videoEl) return;
		videoEl.currentTime = newStart;
		previewMode = 'full';
		previewStopAt = newEnd;
		videoEl.play();
	}

	/** Preview around the start boundary: 3s before start → 3s after start */
	function previewStart() {
		if (!videoEl) return;
		const from = Math.max(0, newStart - CONTEXT_SECONDS);
		const to = newStart + CONTEXT_SECONDS;
		videoEl.currentTime = from;
		previewMode = 'start';
		previewStopAt = to;
		videoEl.play();
	}

	/** Preview around the end boundary: 3s before end → 3s after end */
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
		// Auto-stop at boundary
		if (previewStopAt !== null && videoEl.currentTime >= previewStopAt) {
			stopPreview();
		}
	}

	function togglePlay() {
		if (!videoEl) return;
		if (videoEl.paused) {
			// If no preview mode active, just play full clip
			if (!previewMode) {
				videoEl.currentTime = newStart;
				previewMode = 'full';
				previewStopAt = newEnd;
			}
			videoEl.play();
			isPlaying = true;
		} else {
			stopPreview();
		}
	}

	function seekToStart() {
		if (!videoEl) return;
		stopPreview();
		videoEl.currentTime = newStart;
		currentTime = newStart;
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

	// Range slider position calculations
	const rangeStartPct = $derived((newStart / videoDuration) * 100);
	const rangeEndPct = $derived((newEnd / videoDuration) * 100);
	const rangeWidthPct = $derived(rangeEndPct - rangeStartPct);
	const playheadPct = $derived((currentTime / videoDuration) * 100);

	// Preview mode label
	const previewLabel = $derived(
		previewMode === 'start'
			? 'Previewing start boundary…'
			: previewMode === 'end'
				? 'Previewing end boundary…'
				: previewMode === 'full'
					? 'Previewing full clip…'
					: null
	);
</script>

<div class="bg-zinc-950 rounded-xl border border-indigo-500/40 p-4 space-y-4">
	<div class="flex items-center justify-between">
		<h4 class="text-sm font-semibold text-indigo-400">✎ Clip Editor</h4>
		<button onclick={onCancel} class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
			Close
		</button>
	</div>

	<!-- Source video player -->
	<div class="aspect-video bg-black rounded-lg overflow-hidden relative">
		<video
			bind:this={videoEl}
			ontimeupdate={handleTimeUpdate}
			onplay={() => (isPlaying = true)}
			onpause={() => { isPlaying = false; }}
			preload="metadata"
			class="w-full h-full"
		>
			<source src={sourceVideoUrl} type="video/mp4" />
			<track kind="captions" />
		</video>
		<!-- Playhead time overlay -->
		<div
			class="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-mono px-2 py-1 rounded"
		>
			{fmtTime(currentTime)}
		</div>
		<!-- Preview mode indicator -->
		{#if previewLabel}
			<div
				class="absolute top-2 left-1/2 -translate-x-1/2 bg-indigo-600/90 text-white text-xs font-medium px-3 py-1 rounded-full"
			>
				{previewLabel}
			</div>
		{/if}
	</div>

	<!-- Timeline range bar -->
	<div class="space-y-2">
		<div class="text-xs text-zinc-500 flex justify-between">
			<span>0:00</span>
			<span>{fmtTime(videoDuration)}</span>
		</div>
		<div class="relative h-8 bg-zinc-800 rounded-lg overflow-hidden cursor-pointer">
			<!-- Selected range highlight -->
			<div
				class="absolute top-0 h-full bg-indigo-500/30 border-x-2 border-indigo-500"
				style="left: {rangeStartPct}%; width: {rangeWidthPct}%"
			></div>
			<!-- Original range ghost -->
			<div
				class="absolute top-0 h-full border-x border-dashed border-zinc-600 opacity-50"
				style="left: {(clip.startSeconds / videoDuration) * 100}%; width: {((clip.endSeconds - clip.startSeconds) / videoDuration) * 100}%"
			></div>
			<!-- Playhead -->
			<div
				class="absolute top-0 h-full w-0.5 bg-white"
				style="left: {playheadPct}%"
			></div>
		</div>
	</div>

	<!-- Transport controls -->
	<div class="flex items-center justify-center gap-2">
		<button
			onclick={seekToStart}
			class="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
			title="Go to clip start"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
				<path d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" />
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
	</div>

	<!-- Preview buttons — the main UX improvement -->
	<div class="grid grid-cols-3 gap-2">
		<button
			onclick={previewStart}
			class="px-3 py-2 rounded-lg text-xs font-medium transition-colors
				{previewMode === 'start'
				? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
				: 'bg-zinc-800 text-zinc-400 hover:bg-emerald-600/10 hover:text-emerald-400'}"
		>
			◂ Preview Start
			<span class="block text-[10px] opacity-60 mt-0.5">
				{fmtTime(Math.max(0, newStart - CONTEXT_SECONDS))} → {fmtTime(newStart + CONTEXT_SECONDS)}
			</span>
		</button>
		<button
			onclick={previewFull}
			class="px-3 py-2 rounded-lg text-xs font-medium transition-colors
				{previewMode === 'full'
				? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/40'
				: 'bg-zinc-800 text-zinc-400 hover:bg-indigo-600/10 hover:text-indigo-400'}"
		>
			▶ Full Clip
			<span class="block text-[10px] opacity-60 mt-0.5">
				{fmtTime(newStart)} → {fmtTime(newEnd)}
			</span>
		</button>
		<button
			onclick={previewEnd}
			class="px-3 py-2 rounded-lg text-xs font-medium transition-colors
				{previewMode === 'end'
				? 'bg-amber-600/30 text-amber-400 border border-amber-500/40'
				: 'bg-zinc-800 text-zinc-400 hover:bg-amber-600/10 hover:text-amber-400'}"
		>
			Preview End ▸
			<span class="block text-[10px] opacity-60 mt-0.5">
				{fmtTime(Math.max(0, newEnd - CONTEXT_SECONDS))} → {fmtTime(Math.min(videoDuration, newEnd + CONTEXT_SECONDS))}
			</span>
		</button>
	</div>

	<!-- Set from playhead buttons -->
	<div class="flex gap-2">
		<button
			onclick={setStartFromPlayhead}
			class="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-600/10 transition-colors"
		>
			Set Start → {fmtTime(currentTime)}
		</button>
		<button
			onclick={setEndFromPlayhead}
			class="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 text-zinc-400 hover:text-amber-400 hover:bg-amber-600/10 transition-colors"
		>
			Set End → {fmtTime(currentTime)}
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
			💾 Save Edit
		</button>
		<button
			onclick={onCancel}
			class="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
		>
			Cancel
		</button>
	</div>
</div>
