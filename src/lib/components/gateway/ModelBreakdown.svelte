<script lang="ts">
	import type { GatewayModelUsage } from '$lib/types';

	let { models }: { models: GatewayModelUsage[] } = $props();

	const totalCost = $derived(models.reduce((s, m) => s + m.cost, 0) || 1);
</script>

<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-4 sm:p-6">
	<h3 class="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">By Model</h3>

	{#if models.length === 0}
		<p class="text-zinc-600 text-sm">No data</p>
	{:else}
		<div class="space-y-3">
			{#each models as m}
				{@const pct = (m.cost / totalCost) * 100}
				<div class="flex items-center justify-between text-sm">
					<div class="flex items-center gap-2 min-w-0">
						<span
							class="inline-block w-2 h-2 rounded-full flex-shrink-0"
							style="background-color: {m.model.includes('opus')
								? '#8b5cf6'
								: m.model.includes('sonnet')
									? '#6366f1'
									: m.model.includes('gemini')
										? '#10b981'
										: '#71717a'};"
						></span>
						<span class="text-zinc-300 truncate">{m.model}</span>
					</div>
					<div class="text-right whitespace-nowrap ml-3">
						<span class="text-white font-medium">${m.cost.toFixed(2)}</span>
						<span class="text-zinc-600 ml-1">({pct.toFixed(0)}%)</span>
					</div>
				</div>
				<div class="h-1.5 bg-zinc-800 rounded-full overflow-hidden -mt-1">
					<div
						class="h-full rounded-full"
						style="width: {pct}%; background-color: {m.model.includes('opus')
							? '#8b5cf6'
							: m.model.includes('sonnet')
								? '#6366f1'
								: m.model.includes('gemini')
									? '#10b981'
									: '#71717a'};"
					></div>
				</div>
			{/each}
		</div>

		<div class="mt-4 pt-3 border-t border-zinc-800 flex justify-between text-xs text-zinc-500">
			<span>{models.reduce((s, m) => s + m.messages, 0).toLocaleString()} total messages</span>
			<span>{models.length} models</span>
		</div>
	{/if}
</div>
