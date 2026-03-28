<script lang="ts">
	import type { GatewayHeartbeatConfig } from '$lib/types';

	let {
		heartbeat,
		primaryModel,
		sessionCount,
		activeCount
	}: {
		heartbeat: GatewayHeartbeatConfig;
		primaryModel: string;
		sessionCount: number;
		activeCount: number;
	} = $props();
</script>

<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
	<h2 class="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Agent Heartbeat</h2>
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
		<div>
			<p class="text-xs text-zinc-500">Interval</p>
			<p class="text-lg font-semibold text-white mt-0.5">
				{heartbeat.every}
			</p>
		</div>
		<div>
			<p class="text-xs text-zinc-500">Active Sessions</p>
			<p class="text-lg font-semibold text-emerald-400 mt-0.5">
				{activeCount}
				<span class="text-sm text-zinc-500 font-normal">/ {sessionCount}</span>
			</p>
		</div>
		<div>
			<p class="text-xs text-zinc-500">Heartbeat Model</p>
			<p class="text-sm text-zinc-300 mt-1 truncate" title={heartbeat.model}>
				{heartbeat.model?.split('/').pop() ?? 'default'}
			</p>
		</div>
		<div>
			<p class="text-xs text-zinc-500">Primary Model</p>
			<p class="text-sm text-zinc-300 mt-1 truncate" title={primaryModel}>
				{primaryModel.split('/').pop()}
			</p>
		</div>
	</div>
</div>
