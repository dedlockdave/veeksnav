<script lang="ts">
	import type { GatewayDailyUsage } from '$lib/types';

	let { daily }: { daily: GatewayDailyUsage[] } = $props();

	const maxCost = $derived(Math.max(...daily.map((d) => d.cost), 0.01));
	const chartHeight = 200;
	const barPad = 2;

	let hoveredIdx = $state<number | null>(null);

	function fmtDate(d: string) {
		const [, m, day] = d.split('-');
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return `${months[parseInt(m) - 1]} ${parseInt(day)}`;
	}

	function fmtTokens(n: number) {
		return n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}k` : `${n}`;
	}
</script>

<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-4 sm:p-6">
	<div class="flex items-center justify-between mb-4">
		<h3 class="text-sm font-medium text-zinc-400 uppercase tracking-wider">Daily Spend</h3>
		{#if hoveredIdx !== null}
			<div class="text-xs text-zinc-400">
				<span class="text-white font-semibold">${daily[hoveredIdx].cost.toFixed(2)}</span>
				on {fmtDate(daily[hoveredIdx].date)}
				&middot; {daily[hoveredIdx].messages} msgs
				&middot; {fmtTokens(daily[hoveredIdx].inputTokens)} in / {fmtTokens(daily[hoveredIdx].outputTokens)} out
			</div>
		{/if}
	</div>

	{#if daily.length === 0}
		<p class="text-zinc-600 text-sm text-center py-8">No usage data yet</p>
	{:else}
		<div class="overflow-x-auto">
			<svg
				viewBox="0 0 {daily.length * 48 + 20} {chartHeight + 32}"
				class="w-full min-w-[300px]"
				style="max-height: 280px;"
			>
				<!-- Y-axis guide lines -->
				{#each [0.25, 0.5, 0.75, 1] as frac}
					<line
						x1="10"
						y1={chartHeight - chartHeight * frac + 8}
						x2={daily.length * 48 + 10}
						y2={chartHeight - chartHeight * frac + 8}
						stroke="#27272a"
						stroke-width="1"
					/>
					<text
						x="6"
						y={chartHeight - chartHeight * frac + 4}
						fill="#52525b"
						font-size="8"
						text-anchor="end"
					>
						${(maxCost * frac).toFixed(0)}
					</text>
				{/each}

				<!-- Bars -->
				{#each daily as day, i}
					{@const barH = (day.cost / maxCost) * chartHeight}
					{@const x = i * 48 + 14}
					{@const isHovered = hoveredIdx === i}

					<!-- Hit area -->
					<rect
						{x}
						y="0"
						width={48 - barPad * 2}
						height={chartHeight + 28}
						fill="transparent"
						onmouseenter={() => (hoveredIdx = i)}
						onmouseleave={() => (hoveredIdx = null)}
						role="presentation"
					/>

					<!-- Bar -->
					<rect
						{x}
						y={chartHeight - barH + 8}
						width={48 - barPad * 2}
						height={barH}
						rx="4"
						fill={isHovered ? '#818cf8' : '#6366f1'}
						opacity={isHovered ? 1 : 0.8}
						class="transition-all duration-150"
					/>

					<!-- Date label -->
					<text
						x={x + (48 - barPad * 2) / 2}
						y={chartHeight + 24}
						fill="#71717a"
						font-size="9"
						text-anchor="middle"
					>
						{fmtDate(day.date)}
					</text>
				{/each}
			</svg>
		</div>
	{/if}
</div>
