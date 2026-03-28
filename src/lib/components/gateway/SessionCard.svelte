<script lang="ts">
	import type { GatewaySession } from '$lib/types';

	let { session }: { session: GatewaySession } = $props();

	function relativeTime(ms: number): string {
		const diff = Date.now() - ms;
		if (diff < 60_000) return '<1m ago';
		if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m ago`;
		if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)}h ago`;
		return `${Math.round(diff / 86_400_000)}d ago`;
	}

	function channelLabel(s: GatewaySession): string {
		if (s.deliveryContext?.channel) return s.deliveryContext.channel;
		if (s.sessionKey.includes('discord')) return 'discord';
		if (s.sessionKey.includes('telegram')) return 'telegram';
		if (s.sessionKey.includes('heartbeat') || s.sessionKey === 'agent:main:main') return 'heartbeat';
		return 'unknown';
	}

	function sessionLabel(s: GatewaySession): string {
		if (s.origin?.label) return s.origin.label;
		// Extract readable name from session key
		const parts = s.sessionKey.split(':');
		return parts.slice(-1)[0] ?? s.sessionKey;
	}

	const channelColors: Record<string, string> = {
		discord: 'text-indigo-400',
		telegram: 'text-blue-400',
		heartbeat: 'text-amber-400',
		unknown: 'text-zinc-500'
	};
</script>

<div class="flex items-center gap-4 px-4 py-3 border-b border-zinc-800 last:border-b-0">
	<span class="text-xs font-medium {channelColors[channelLabel(session)] ?? 'text-zinc-500'}">
		{channelLabel(session)}
	</span>
	<span class="text-sm text-zinc-300 truncate flex-1" title={session.sessionKey}>
		{sessionLabel(session)}
	</span>
	{#if session.model}
		<span class="text-xs text-zinc-600 truncate max-w-40">{session.model.split('/').pop()}</span>
	{/if}
	<span class="text-xs text-zinc-500 shrink-0">{relativeTime(session.updatedAt)}</span>
</div>
