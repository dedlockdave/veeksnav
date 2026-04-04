<script lang="ts">
	import type { GatewayUsageTotals } from '$lib/types';

	let { totals }: { totals: GatewayUsageTotals } = $props();

	const stats = $derived([
		{ label: 'All Time', value: `$${totals.allTime.toFixed(2)}`, sub: 'total spend' },
		{ label: 'Last 7 Days', value: `$${totals.last7d.toFixed(2)}`, sub: 'this week' },
		{ label: 'Last 30 Days', value: `$${totals.last30d.toFixed(2)}`, sub: 'this month' },
		{
			label: 'Messages',
			value: totals.totalMessages.toLocaleString(),
			sub: 'assistant turns'
		}
	]);
</script>

<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
	{#each stats as stat}
		<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
			<p class="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</p>
			<p class="text-2xl font-bold text-white mt-1">{stat.value}</p>
			<p class="text-xs text-zinc-600 mt-0.5">{stat.sub}</p>
		</div>
	{/each}
</div>
