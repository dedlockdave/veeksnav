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
		class="w-full text-left px-4 py-3 hover:bg-zinc-800/50 transition-colors"
		onclick={() => (expanded = !expanded)}
	>
		<div class="flex items-center gap-4 text-sm">
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
		<div class="px-4 pb-4 space-y-2">
			{#if run.summary}
				<p class="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{run.summary}</p>
			{/if}
			{#if run.error}
				<p class="text-sm text-red-400">{run.error}</p>
			{/if}
			{#if run.usage}
				<div class="flex gap-4 text-xs text-zinc-500">
					<span>In: {formatTokens(run.usage.input_tokens)}</span>
					<span>Out: {formatTokens(run.usage.output_tokens)}</span>
					{#if run.deliveryStatus}
						<span>Delivery: {run.deliveryStatus}</span>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>
