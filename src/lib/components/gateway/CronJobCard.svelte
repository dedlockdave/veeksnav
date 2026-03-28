<script lang="ts">
	import type { GatewayCronJob } from '$lib/types';

	let { job }: { job: GatewayCronJob } = $props();

	const statusColors: Record<string, string> = {
		ok: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
		error: 'bg-red-500/20 text-red-400 border-red-500/30',
		disabled: 'bg-zinc-700/20 text-zinc-500 border-zinc-700/30'
	};

	function statusKey(job: GatewayCronJob): string {
		if (!job.enabled) return 'disabled';
		return job.state.lastRunStatus === 'error' ? 'error' : 'ok';
	}

	function relativeTime(ms: number): string {
		const diff = Date.now() - ms;
		if (diff < 0) {
			const future = -diff;
			if (future < 60_000) return 'in <1m';
			if (future < 3_600_000) return `in ${Math.round(future / 60_000)}m`;
			if (future < 86_400_000) return `in ${Math.round(future / 3_600_000)}h`;
			return `in ${Math.round(future / 86_400_000)}d`;
		}
		if (diff < 60_000) return '<1m ago';
		if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m ago`;
		if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)}h ago`;
		return `${Math.round(diff / 86_400_000)}d ago`;
	}

	function formatDuration(ms: number): string {
		const s = Math.round(ms / 1000);
		if (s < 60) return `${s}s`;
		return `${Math.floor(s / 60)}m ${s % 60}s`;
	}

	function cronToHuman(expr: string, tz: string): string {
		const parts = expr.split(' ');
		if (parts.length < 5) return expr;
		const [min, hour, , , dow] = parts;
		const timeStr = `${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
		const tzShort = tz.split('/').pop()?.replace('_', ' ') ?? tz;

		if (dow === '*') return `Daily ${timeStr} ${tzShort}`;
		const days = dow
			.split(',')
			.map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseInt(d)] ?? d);
		return `${days.join(', ')} ${timeStr} ${tzShort}`;
	}

	let sk = $derived(statusKey(job));
</script>

<a
	href="/gateway/jobs/{job.id}"
	class="block bg-zinc-900 rounded-xl border border-zinc-800 p-3 sm:p-5 hover:border-zinc-700 transition-colors"
>
	<div class="flex items-start justify-between gap-3">
		<div class="min-w-0">
			<div class="flex items-center gap-3 mb-1">
				<h3 class="text-base font-semibold text-white truncate">{job.name}</h3>
				<span
					class="px-2.5 py-0.5 rounded-full border text-xs font-medium shrink-0 {statusColors[sk]}"
				>
					{job.enabled ? job.state.lastRunStatus : 'disabled'}
				</span>
			</div>
			<p class="text-sm text-zinc-400">{cronToHuman(job.schedule.expr, job.schedule.tz)}</p>
		</div>

		{#if job.state.consecutiveErrors > 0}
			<span class="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-lg shrink-0">
				{job.state.consecutiveErrors} error{job.state.consecutiveErrors !== 1 ? 's' : ''}
			</span>
		{/if}
	</div>

	<div class="flex flex-wrap gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs text-zinc-500">
		{#if job.state.lastRunAtMs}
			<span>Last: {relativeTime(job.state.lastRunAtMs)}</span>
		{/if}
		{#if job.state.nextRunAtMs}
			<span>Next: {relativeTime(job.state.nextRunAtMs)}</span>
		{/if}
		{#if job.state.lastDurationMs}
			<span>Duration: {formatDuration(job.state.lastDurationMs)}</span>
		{/if}
		{#if job.delivery.channel}
			<span class="text-zinc-600">via {job.delivery.channel}</span>
		{/if}
	</div>

	{#if job.state.lastError}
		<p class="mt-2 text-xs text-red-400/80 line-clamp-2">{job.state.lastError}</p>
	{/if}
</a>
