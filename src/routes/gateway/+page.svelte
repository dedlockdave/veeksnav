<script lang="ts">
	import { onMount } from 'svelte';
	import type { GatewayCronJob, GatewaySession, GatewayHeartbeatConfig } from '$lib/types';
	import CronJobCard from '$lib/components/gateway/CronJobCard.svelte';
	import HeartbeatPanel from '$lib/components/gateway/HeartbeatPanel.svelte';
	import SessionCard from '$lib/components/gateway/SessionCard.svelte';

	let jobs = $state<GatewayCronJob[]>([]);
	let sessions = $state<GatewaySession[]>([]);
	let sessionTotal = $state(0);
	let sessionActive = $state(0);
	let heartbeat = $state<GatewayHeartbeatConfig>({ every: '...' });
	let primaryModel = $state('...');
	let loading = $state(true);
	let error = $state('');

	let jobsWithErrors = $derived(jobs.filter((j) => j.state.consecutiveErrors > 0));
	let enabledJobs = $derived(jobs.filter((j) => j.enabled));
	let showAllSessions = $state(false);
	let visibleSessions = $derived(showAllSessions ? sessions : sessions.slice(0, 10));

	async function fetchAll() {
		try {
			const [jobsRes, sessionsRes, configRes] = await Promise.all([
				fetch('/api/gateway/jobs'),
				fetch('/api/gateway/sessions'),
				fetch('/api/gateway/config')
			]);

			if (jobsRes.ok) jobs = await jobsRes.json();
			if (sessionsRes.ok) {
				const data = await sessionsRes.json();
				sessions = data.sessions;
				sessionTotal = data.total;
				sessionActive = data.recentlyActive;
			}
			if (configRes.ok) {
				const data = await configRes.json();
				heartbeat = data.heartbeat;
				primaryModel = data.primaryModel;
			}
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Failed to load gateway data';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchAll();
		const interval = setInterval(fetchAll, 60_000);
		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Gateway — VeeksNav</title>
</svelte:head>

<div class="space-y-8">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
		<div>
			<h1 class="text-2xl sm:text-3xl font-bold text-white">Gateway</h1>
			<p class="text-zinc-400 text-sm mt-1">Cron jobs, agent heartbeat, and session activity</p>
		</div>
		{#if !loading}
			<button
				class="self-start px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300 transition-colors"
				onclick={fetchAll}
			>
				Refresh
			</button>
		{/if}
	</div>

	{#if loading}
		<div class="text-center py-12 text-zinc-500 animate-pulse">Loading gateway data…</div>
	{:else if error}
		<div class="text-center py-12 text-red-400">{error}</div>
	{:else}
		<!-- Stats bar -->
		<div class="flex flex-wrap gap-3 sm:gap-6 text-sm">
			<span class="text-zinc-400">
				<span class="text-white font-semibold">{enabledJobs.length}</span> active jobs
			</span>
			{#if jobsWithErrors.length > 0}
				<span class="text-red-400">
					<span class="font-semibold">{jobsWithErrors.length}</span> with errors
				</span>
			{/if}
			<span class="text-zinc-400">
				<span class="text-white font-semibold">{sessionActive}</span> sessions active (24h)
			</span>
		</div>

		<!-- Heartbeat -->
		<HeartbeatPanel
			{heartbeat}
			{primaryModel}
			sessionCount={sessionTotal}
			activeCount={sessionActive}
		/>

		<!-- Cron Jobs -->
		<div>
			<h2 class="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Cron Jobs</h2>
			<div class="grid gap-3 sm:grid-cols-2">
				{#each jobs as job (job.id)}
					<CronJobCard {job} />
				{/each}
			</div>
		</div>

		<!-- Sessions -->
		<div>
			<h2 class="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
				Recent Sessions
				<span class="text-zinc-600 font-normal">({sessionTotal})</span>
			</h2>
			<div class="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
				{#each visibleSessions as session (session.sessionId)}
					<SessionCard {session} />
				{:else}
					<p class="text-zinc-500 text-sm p-4">No sessions found</p>
				{/each}
			</div>
			{#if sessions.length > 10}
				<button
					class="mt-2 text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
					onclick={() => (showAllSessions = !showAllSessions)}
				>
					{showAllSessions ? 'Show less' : `Show all ${sessions.length} sessions`}
				</button>
			{/if}
		</div>
	{/if}
</div>
