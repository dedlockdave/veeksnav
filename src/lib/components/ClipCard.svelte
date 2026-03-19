<script lang="ts">
	import type { Clip, ClipEdit } from '$lib/types';
	import ClipEditor from './ClipEditor.svelte';

	let {
		clip,
		status = 'pending',
		editing = false,
		sourceVideoUrl = '',
		videoDuration = 900,
		onStatusChange,
		onEdit,
		onEditSave
	}: {
		clip: Clip;
		status?: 'pending' | 'accepted' | 'rejected';
		editing?: boolean;
		sourceVideoUrl?: string;
		videoDuration?: number;
		onStatusChange?: (clipId: string, status: 'pending' | 'accepted' | 'rejected') => void;
		onEdit?: (clipId: string) => void;
		onEditSave?: (edit: ClipEdit) => void;
	} = $props();

	let hasEdits = $state(false);
	let savedEdit = $state<ClipEdit | null>(null);

	const borderColor = $derived(
		editing
			? 'border-indigo-500/60'
			: status === 'accepted'
				? 'border-emerald-500/60'
				: status === 'rejected'
					? 'border-red-500/60 opacity-60'
					: 'border-zinc-800'
	);

	function accept() {
		onStatusChange?.(clip.id, status === 'accepted' ? 'pending' : 'accepted');
	}

	function reject() {
		onStatusChange?.(clip.id, status === 'rejected' ? 'pending' : 'rejected');
	}

	function handleEditSave(edit: ClipEdit) {
		savedEdit = edit;
		hasEdits = true;
		onEditSave?.(edit);
	}
</script>

<div class="bg-zinc-900 rounded-xl border-2 {borderColor} overflow-hidden transition-all">
	<!-- Status indicator strip -->
	{#if hasEdits && !editing}
		<div class="bg-indigo-500/20 text-indigo-400 text-xs font-medium text-center py-1">
			✎ Edit queued — {savedEdit
				? `${Math.floor(savedEdit.newStart / 60)}:${String(savedEdit.newStart % 60).padStart(2, '0')} → ${Math.floor(savedEdit.newEnd / 60)}:${String(savedEdit.newEnd % 60).padStart(2, '0')}`
				: ''}
		</div>
	{:else if status === 'accepted'}
		<div class="bg-emerald-500/20 text-emerald-400 text-xs font-medium text-center py-1">
			✓ Accepted
		</div>
	{:else if status === 'rejected'}
		<div class="bg-red-500/20 text-red-400 text-xs font-medium text-center py-1">✗ Rejected</div>
	{/if}

	{#if editing}
		<!-- Editor mode -->
		<div class="p-3">
			<ClipEditor
				{clip}
				{sourceVideoUrl}
				{videoDuration}
				onSave={handleEditSave}
				onCancel={() => onEdit?.(clip.id)}
			/>
		</div>
	{:else}
		<!-- Normal clip view -->
		<div class="aspect-video bg-black">
			<video controls preload="metadata" class="w-full h-full" poster="">
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
			<span
				class="inline-block text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded mb-2"
			>
				{clip.timestamp}
			</span>
			<p class="text-sm text-zinc-400 mb-2">{clip.description}</p>
			<p class="text-sm text-zinc-300 border-l-2 border-indigo-500 pl-3 italic mb-3">
				{clip.assessment}
			</p>

			<!-- Per-clip actions -->
			<div class="flex gap-2 pt-2 border-t border-zinc-800">
				<button
					onclick={accept}
					class="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors {status ===
					'accepted'
						? 'bg-emerald-600 text-white'
						: 'bg-zinc-800 text-zinc-400 hover:bg-emerald-600/20 hover:text-emerald-400'}"
				>
					✓ Use
				</button>
				<button
					onclick={() => onEdit?.(clip.id)}
					class="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
						{hasEdits
						? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
						: 'bg-zinc-800 text-zinc-400 hover:bg-indigo-600/20 hover:text-indigo-400'}"
				>
					✎ Edit
				</button>
				<button
					onclick={reject}
					class="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors {status ===
					'rejected'
						? 'bg-red-600 text-white'
						: 'bg-zinc-800 text-zinc-400 hover:bg-red-600/20 hover:text-red-400'}"
				>
					✗ Skip
				</button>
			</div>
		</div>
	{/if}
</div>
