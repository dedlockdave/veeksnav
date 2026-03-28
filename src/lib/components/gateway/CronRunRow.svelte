<script lang="ts">
	import type { GatewayCronRun } from '$lib/types';

	let { run }: { run: GatewayCronRun } = $props();
	let expanded = $state(false);

	const statusColors: Record<string, string> = {
		ok: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
		error: 'bg-red-500/20 text-red-400 border-red-500/30'
	};

	function formatTs(ms: number): string {
		return new Date(ms).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	function formatDuration(ms: number): string {
		const s = Math.round(ms / 1000);
		if (s < 60) return `${s}s`;
		return `${Math.floor(s / 60)}m ${s % 60}s`;
	}

	function formatTokens(n: number): string {
		if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
		return String(n);
	}
</script>

<div class="border-b border-zinc-800 last:border-b-0">
	<button
		class="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-zinc-800/50 transition-colors"
		onclick={() => (expanded = !expanded)}
	>
		<!-- Mobile layout -->
		<div class="flex sm:hidden items-center gap-2 text-xs">
			<span
				class="px-2 py-0.5 rounded-full border text-xs font-medium {statusColors[run.status] ??
					'bg-zinc-700/20 text-zinc-500 border-zinc-700/30'}"
			>
				{run.status}
			</span>
			<span class="text-zinc-400">{formatTs(run.ts)}</span>
			<span class="text-zinc-500">{formatDuration(run.durationMs)}</span>
			<span class="text-zinc-600 ml-auto">{expanded ? '▲' : '▼'}</span>
		</div>

		<!-- Desktop layout -->
		<div class="hidden sm:flex items-center gap-4 text-sm">
			<span class="text-zinc-400 w-36 shrink-0">{formatTs(run.ts)}</span>
			<span
				class="px-2 py-0.5 rounded-full border text-xs font-medium {statusColors[run.status] ??
					'bg-zinc-700/20 text-zinc-500 border-zinc-700/30'}"
			>
				{run.status}
			</span>
			<span class="text-zinc-500 text-xs">{formatDuration(run.durationMs)}</span>
			{#if run.model}
				<span class="text-zinc-600 text-xs truncate">{run.model.split('/').pop()}</span>
			{/if}
			{#if run.usage}
				<span class="text-zinc-600 text-xs ml-auto">
					{formatTokens(run.usage.input_tokens + run.usage.output_tokens)} tokens
				</span>
			{/if}
			<span class="text-zinc-600 text-xs">{expanded ? '▲' : '▼'}</span>
		</div>
	</button>

	{#if expanded}
		<div class="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
			{#if run.summary}
				<p class="text-xs sm:text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{run.summary}</p>
			{/if}
			{#if run.error}
				<p class="text-xs sm:text-sm text-red-400">{run.error}</p>
			{/if}
			{#if run.usage}
				<div class="flex flex-wrap gap-2 sm:gap-4 text-xs text-zinc-500">
					<span>In: {formatTokens(run.usage.input_tokens)}</span>
					<span>Out: {formatTokens(run.usage.output_tokens)}</span>
					{#if run.model}
						<span class="sm:hidden text-zinc-600">{run.model.split('/').pop()}</span>
					{/if}
					{#if run.deliveryStatus}
						<span>Delivery: {run.deliveryStatus}</span>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>
