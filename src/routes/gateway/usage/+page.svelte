<script lang="ts">
	import { usage, syncedAt } from '$lib/data/gateway';
	import UsageStats from '$lib/components/gateway/UsageStats.svelte';
	import UsageChart from '$lib/components/gateway/UsageChart.svelte';
	import ChannelBreakdown from '$lib/components/gateway/ChannelBreakdown.svelte';
	import ModelBreakdown from '$lib/components/gateway/ModelBreakdown.svelte';

	const syncedDate = syncedAt ? new Date(syncedAt).toLocaleString() : 'unknown';
</script>

<svelte:head>
	<title>Usage — VeeksNav</title>
</svelte:head>

<div class="space-y-8">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
		<div>
			<div class="flex items-center gap-3">
				<a
					href="/gateway"
					class="text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
				>
					Gateway
				</a>
				<span class="text-zinc-700">/</span>
				<h1 class="text-2xl sm:text-3xl font-bold text-white">Usage</h1>
			</div>
			<p class="text-zinc-400 text-sm mt-1">Token spend by day, channel, and model</p>
		</div>
		<span class="text-xs text-zinc-600">Synced {syncedDate}</span>
	</div>

	<UsageStats totals={usage.totals} />

	<UsageChart daily={usage.daily} />

	<div class="grid gap-6 lg:grid-cols-2">
		<ChannelBreakdown channels={usage.channels} />
		<ModelBreakdown models={usage.models} />
	</div>
</div>
