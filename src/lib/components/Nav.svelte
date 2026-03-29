<script lang="ts">
	import { page } from '$app/state';
	import { Motion } from 'svelte-motion';

	let open = $state(false);

	const links = [
		{ href: '/', label: 'Home', match: (p: string) => p === '/' },
		{ href: '/videos', label: 'Reviews', match: (p: string) => p.startsWith('/videos') },
		{ href: '/queue', label: 'Queue', match: (p: string) => p.startsWith('/queue') },
		{ href: '/journal', label: 'Journal', match: (p: string) => p.startsWith('/journal') },
		{ href: '/gateway', label: 'Gateway', match: (p: string) => p.startsWith('/gateway') },
		{ href: 'https://dedlockdave.github.io/datclaw/', label: 'Docs', external: true, match: () => false }
	];
</script>

<Motion
	initial={{ opacity: 0, y: -20 }}
	animate={{ opacity: 1, y: 0 }}
	transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
	let:motion
>
	<nav use:motion class="bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800/60 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-50">
		<div class="max-w-7xl mx-auto flex items-center justify-between">
			<a href="/" class="text-xl font-black text-white tracking-tight transition-all duration-300 hover:scale-105">
				Veeks<span class="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Nav</span>
			</a>

			<!-- Mobile hamburger -->
			<button
				class="sm:hidden p-1.5 text-zinc-400 hover:text-white transition-colors"
				onclick={() => (open = !open)}
				aria-label="Toggle menu"
			>
				{#if open}
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				{:else}
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				{/if}
			</button>

			<!-- Desktop links -->
			<div class="hidden sm:flex gap-1 text-sm">
				{#each links as link, i}
					<Motion
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
						let:motion
					>
						<a
							use:motion
							href={link.href}
							target={link.external ? '_blank' : undefined}
							rel={link.external ? 'noopener noreferrer' : undefined}
							class="relative px-3 py-1.5 rounded-lg transition-all duration-300 {link.match(page.url.pathname)
								? 'text-white bg-zinc-800/80'
								: 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'}"
						>
							{link.label}
							{#if link.external}
								<svg class="inline-block w-3 h-3 ml-0.5 -mt-0.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
							{/if}
							{#if link.match(page.url.pathname)}
								<div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-indigo-400 rounded-full"></div>
							{/if}
						</a>
					</Motion>
				{/each}
			</div>
		</div>

		<!-- Mobile menu -->
		{#if open}
			<div class="sm:hidden mt-3 pt-3 border-t border-zinc-800/60 flex flex-col gap-1 text-sm">
				{#each links as link}
					<a
						href={link.href}
						target={link.external ? '_blank' : undefined}
						rel={link.external ? 'noopener noreferrer' : undefined}
						class="py-2 px-3 rounded-lg transition-all duration-300 {link.match(page.url.pathname)
							? 'text-white bg-zinc-800/80'
							: 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'}"
						onclick={() => (open = false)}
					>
						{link.label}
						{#if link.external}
							<svg class="inline-block w-3 h-3 ml-0.5 -mt-0.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
						{/if}
					</a>
				{/each}
			</div>
		{/if}
	</nav>
</Motion>
