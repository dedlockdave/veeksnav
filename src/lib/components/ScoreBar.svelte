<script lang="ts">
	import { Motion } from 'svelte-motion';

	let { label, score, max = 10 }: { label: string; score: number; max?: number } = $props();

	function barColor(s: number): string {
		if (s < 5) return 'bg-red-500';
		if (s <= 7) return 'bg-amber-500';
		return 'bg-emerald-500';
	}

	function glowColor(s: number): string {
		if (s < 5) return 'shadow-[0_0_12px_rgba(239,68,68,0.3)]';
		if (s <= 7) return 'shadow-[0_0_12px_rgba(245,158,11,0.3)]';
		return 'shadow-[0_0_12px_rgba(16,185,129,0.3)]';
	}

	function textColor(s: number): string {
		if (s < 5) return 'text-red-400';
		if (s <= 7) return 'text-amber-400';
		return 'text-emerald-400';
	}
</script>

<div class="flex items-center gap-3">
	<span class="text-sm text-zinc-400 w-40 shrink-0">{label}</span>
	<div class="flex-1 bg-zinc-800 rounded-full h-2.5 overflow-hidden">
		<Motion
			initial={{ width: '0%' }}
			whileInView={{ width: `${(score / max) * 100}%` }}
			viewport={{ once: true, amount: 0.5 }}
			transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
			let:motion
		>
			<div
				use:motion
				class="h-full rounded-full {barColor(score)} {glowColor(score)}"
			></div>
		</Motion>
	</div>
	<span class="text-sm font-bold w-10 text-right {textColor(score)}">{score}/{max}</span>
</div>
