<script lang="ts">
	import type { GatewayChannelUsage } from '$lib/types';

	let { channels }: { channels: GatewayChannelUsage[] } = $props();

	const maxCost = $derived(Math.max(...channels.map((c) => c.cost), 0.01));

	const colors = ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];
</script>

<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-4 sm:p-6">
	<h3 class="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">By Channel</h3>

	{#if channels.length === 0}
		<p class="text-zinc-600 text-sm">No data</p>
	{:else}
		<div class="space-y-3">
			{#each channels as ch, i}
				{@const pct = (ch.cost / maxCost) * 100}
				<div>
					<div class="flex items-center justify-between text-sm mb-1">
						<span class="text-zinc-300 truncate mr-2">#{ch.name}</span>
						<span class="text-zinc-400 whitespace-nowrap">
							<span class="text-white font-medium">${ch.cost.toFixed(2)}</span>
							<span class="text-zinc-600 ml-1">{ch.messages} msgs</span>
						</span>
					</div>
					<div class="h-2 bg-zinc-800 rounded-full overflow-hidden">
						<div
							class="h-full rounded-full transition-all duration-300"
							style="width: {pct}%; background-color: {colors[i % colors.length]};"
						></div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
