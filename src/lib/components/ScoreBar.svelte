<script lang="ts">
	let { label, score, max = 10 }: { label: string; score: number; max?: number } = $props();

	function barColor(s: number): string {
		if (s < 5) return 'bg-red-500';
		if (s <= 7) return 'bg-amber-500';
		return 'bg-emerald-500';
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
		<div
			class="h-full rounded-full transition-all {barColor(score)}"
			style="width: {(score / max) * 100}%"
		></div>
	</div>
	<span class="text-sm font-bold w-10 text-right {textColor(score)}">{score}/{max}</span>
</div>
