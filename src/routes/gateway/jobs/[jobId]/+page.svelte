<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { GatewayCronJob, GatewayCronRun } from '$lib/types';
	import CronRunRow from '$lib/components/gateway/CronRunRow.svelte';
	import JobToggle from '$lib/components/gateway/JobToggle.svelte';

	let job = $state<GatewayCronJob | null>(null);
	let runs = $state<GatewayCronRun[]>([]);
	let loading = $state(true);
	let error = $state('');

	const jobId = page.params.jobId;

	async function fetchData() {
		try {
			const [jobsRes, runsRes] = await Promise.all([
				fetch('/api/gateway/jobs'),
				fetch(`/api/gateway/jobs/${jobId}/runs?limit=50`)
			]);

			if (jobsRes.ok) {
				const jobs: GatewayCronJob[] = await jobsRes.json();
				job = jobs.find((j) => j.id === jobId) ?? null;
			}
			if (runsRes.ok) {
				runs = await runsRes.json();
			}
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to load job data';
		} finally {
			loading = false;
		}
	}

	function cronToHuman(expr: string, tz: string): string {
		const parts = expr.split(' ');
		if (parts.length < 5) return expr;
		const [min, hour, , , dow] = parts;
		const timeStr = `${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
		const tzShort = tz.split('/').pop()?.replace('_', ' ') ?? tz;
		if (dow === '*') return `Daily at ${timeStr} ${tzShort}`;
		const days = dow
			.split(',')
			.map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseInt(d)] ?? d);
		return `${days.join(', ')} at ${timeStr} ${tzShort}`;
	}

	function formatDuration(ms: number): string {
		const s = Math.round(ms / 1000);
		if (s < 60) return `${s}s`;
		return `${Math.floor(s / 60)}m ${s % 60}s`;
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

	function handleToggle(enabled: boolean) {
		if (job) job.enabled = enabled;
	}

	onMount(fetchData);
</script>

<svelte:head>
	<title>{job?.name ?? 'Job'} — Gateway — VeeksNav</title>
</svelte:head>

<div class="space-y-6">
	<a href="/gateway" class="text-sm text-zinc-500 hover:text-zinc-400 transition-colors">
		← Back to Gateway
	</a>

	{#if loading}
		<div class="text-center py-12 text-zinc-500 animate-pulse">Loading…</div>
	{:else if error}
		<div class="text-center py-12 text-red-400">{error}</div>
	{:else if !job}
		<div class="text-center py-12 text-zinc-500">Job not found</div>
	{:else}
		<!-- Job header -->
		<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
			<div>
				<h1 class="text-xl sm:text-2xl font-bold text-white">{job.name}</h1>
				<p class="text-zinc-400 text-sm mt-1">{cronToHuman(job.schedule.expr, job.schedule.tz)}</p>
				<p class="text-zinc-600 text-xs mt-0.5">
					{job.schedule.expr} ({job.schedule.tz})
					{#if job.schedule.staggerMs}
						· stagger {Math.round(job.schedule.staggerMs / 60_000)}m
					{/if}
				</p>
			</div>
			<div class="flex items-center gap-3">
				<span class="text-xs text-zinc-500">{job.enabled ? 'Enabled' : 'Disabled'}</span>
				<JobToggle jobId={job.id} enabled={job.enabled} onToggle={handleToggle} />
			</div>
		</div>

		<!-- Status cards -->
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
			<div class="bg-zinc-900 rounded-lg border border-zinc-800 p-3 sm:p-4">
				<p class="text-xs text-zinc-500">Last Run</p>
				<p class="text-sm font-medium text-white mt-1">
					{job.state.lastRunAtMs ? relativeTime(job.state.lastRunAtMs) : 'Never'}
				</p>
			</div>
			<div class="bg-zinc-900 rounded-lg border border-zinc-800 p-3 sm:p-4">
				<p class="text-xs text-zinc-500">Next Run</p>
				<p class="text-sm font-medium text-white mt-1">
					{job.state.nextRunAtMs ? relativeTime(job.state.nextRunAtMs) : 'N/A'}
				</p>
			</div>
			<div class="bg-zinc-900 rounded-lg border border-zinc-800 p-3 sm:p-4">
				<p class="text-xs text-zinc-500">Duration</p>
				<p class="text-sm font-medium text-white mt-1">
					{job.state.lastDurationMs ? formatDuration(job.state.lastDurationMs) : 'N/A'}
				</p>
			</div>
			<div class="bg-zinc-900 rounded-lg border border-zinc-800 p-3 sm:p-4">
				<p class="text-xs text-zinc-500">Status</p>
				<p
					class="text-sm font-medium mt-1 {job.state.lastRunStatus === 'ok'
						? 'text-emerald-400'
						: job.state.lastRunStatus === 'error'
							? 'text-red-400'
							: 'text-zinc-400'}"
				>
					{job.state.lastRunStatus}
					{#if job.state.consecutiveErrors > 0}
						<span class="text-red-400/60">({job.state.consecutiveErrors} consecutive)</span>
					{/if}
				</p>
			</div>
		</div>

		{#if job.state.lastError}
			<div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
				<p class="text-xs text-red-400/60 mb-1">Last Error</p>
				<p class="text-sm text-red-400">{job.state.lastError}</p>
			</div>
		{/if}

		<!-- Config details -->
		<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-4 sm:p-5">
			<h2 class="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">Configuration</h2>
			<div class="space-y-3 text-sm">
				<div class="flex gap-2">
					<span class="text-zinc-500 w-20 sm:w-28 shrink-0">Agent</span>
					<span class="text-zinc-300">{job.agentId}</span>
				</div>
				<div class="flex gap-2">
					<span class="text-zinc-500 w-20 sm:w-28 shrink-0">Session</span>
					<span class="text-zinc-300 text-xs font-mono">{job.sessionKey}</span>
				</div>
				<div class="flex gap-2">
					<span class="text-zinc-500 w-20 sm:w-28 shrink-0">Delivery</span>
					<span class="text-zinc-300"
						>{job.delivery.mode} via {job.delivery.channel ?? 'none'}</span
					>
				</div>
				{#if job.payload.model}
					<div class="flex gap-2">
						<span class="text-zinc-500 w-20 sm:w-28 shrink-0">Model</span>
						<span class="text-zinc-300">{job.payload.model}</span>
					</div>
				{/if}
				{#if job.payload.timeoutSeconds}
					<div class="flex gap-2">
						<span class="text-zinc-500 w-20 sm:w-28 shrink-0">Timeout</span>
						<span class="text-zinc-300">{job.payload.timeoutSeconds}s</span>
					</div>
				{/if}
			</div>
		</div>

		<!-- Prompt -->
		<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-4 sm:p-5">
			<h2 class="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">Prompt</h2>
			<pre
				class="text-xs sm:text-sm text-zinc-300 whitespace-pre-wrap break-words leading-relaxed max-h-64 overflow-y-auto">{job.payload.message}</pre>
		</div>

		<!-- Run history -->
		<div>
			<h2 class="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
				Run History
				<span class="text-zinc-600 font-normal">({runs.length})</span>
			</h2>
			{#if runs.length === 0}
				<p class="text-zinc-500 text-sm">No runs recorded yet</p>
			{:else}
				<div class="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
					{#each runs as run (run.ts)}
						<CronRunRow {run} />
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
