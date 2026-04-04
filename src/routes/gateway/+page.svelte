<script lang="ts">
	import {
		jobs,
		sessions,
		sessionTotal,
		sessionRecentlyActive,
		heartbeat,
		primaryModel,
		syncedAt
	} from '$lib/data/gateway';
	import CronJobCard from '$lib/components/gateway/CronJobCard.svelte';
	import HeartbeatPanel from '$lib/components/gateway/HeartbeatPanel.svelte';
	import SessionCard from '$lib/components/gateway/SessionCard.svelte';

	let showAllSessions = $state(false);
	let jobsWithErrors = $derived(jobs.filter((j) => j.state.consecutiveErrors > 0));
	let enabledJobs = $derived(jobs.filter((j) => j.enabled));
	let visibleSessions = $derived(showAllSessions ? sessions : sessions.slice(0, 10));

	const syncedDate = syncedAt ? new Date(syncedAt).toLocaleString() : 'unknown';
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
		<span class="text-xs text-zinc-600">Synced {syncedDate}</span>
	</div>

	<!-- Stats bar -->
	<div class="flex flex-wrap gap-3 sm:gap-6 text-sm items-center">
		<span class="text-zinc-400">
			<span class="text-white font-semibold">{enabledJobs.length}</span> active jobs
		</span>
		{#if jobsWithErrors.length > 0}
			<span class="text-red-400">
				<span class="font-semibold">{jobsWithErrors.length}</span> with errors
			</span>
		{/if}
		<span class="text-zinc-400">
			<span class="text-white font-semibold">{sessionRecentlyActive}</span> sessions active (24h)
		</span>
		<a
			href="/gateway/usage"
			class="text-xs text-indigo-400 hover:text-indigo-300 transition-colors ml-auto"
		>
			View Usage & Spend &rarr;
		</a>
	</div>

	<!-- Heartbeat -->
	<HeartbeatPanel
		{heartbeat}
		{primaryModel}
		sessionCount={sessionTotal}
		activeCount={sessionRecentlyActive}
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
</div>
