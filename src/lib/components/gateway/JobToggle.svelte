<script lang="ts">
	let {
		jobId,
		enabled,
		onToggle
	}: {
		jobId: string;
		enabled: boolean;
		onToggle: (enabled: boolean) => void;
	} = $props();

	let saving = $state(false);

	async function toggle() {
		saving = true;
		try {
			const res = await fetch(`/api/gateway/jobs/${jobId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ enabled: !enabled })
			});
			if (res.ok) {
				onToggle(!enabled);
			}
		} finally {
			saving = false;
		}
	}
</script>

<button
	class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {enabled
		? 'bg-indigo-600'
		: 'bg-zinc-700'} {saving ? 'opacity-50' : ''}"
	onclick={toggle}
	disabled={saving}
	title={enabled ? 'Disable job' : 'Enable job'}
>
	<span
		class="inline-block h-4 w-4 rounded-full bg-white transition-transform {enabled
			? 'translate-x-6'
			: 'translate-x-1'}"
	></span>
</button>
