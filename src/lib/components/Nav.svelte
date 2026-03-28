<script lang="ts">
	import { page } from '$app/state';

	let open = $state(false);
</script>

<nav class="bg-zinc-900 border-b border-zinc-800 px-4 sm:px-6 py-3 sm:py-4">
	<div class="max-w-7xl mx-auto flex items-center justify-between">
		<a href="/" class="text-xl font-bold text-white tracking-tight">
			Veeks<span class="text-indigo-400">Nav</span>
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
		<div class="hidden sm:flex gap-6 text-sm">
			<a
				href="/"
				class="transition-colors {page.url.pathname === '/'
					? 'text-white'
					: 'text-zinc-400 hover:text-white'}"
			>
				Home
			</a>
			<a
				href="/videos"
				class="transition-colors {page.url.pathname.startsWith('/videos')
					? 'text-white'
					: 'text-zinc-400 hover:text-white'}"
			>
				Reviews
			</a>
			<a
				href="/queue"
				class="transition-colors {page.url.pathname.startsWith('/queue')
					? 'text-white'
					: 'text-zinc-400 hover:text-white'}"
			>
				Queue
			</a>
			<a
				href="/journal"
				class="transition-colors {page.url.pathname.startsWith('/journal')
					? 'text-white'
					: 'text-zinc-400 hover:text-white'}"
			>
				Journal
			</a>
			<a
				href="/gateway"
				class="transition-colors {page.url.pathname.startsWith('/gateway')
					? 'text-white'
					: 'text-zinc-400 hover:text-white'}"
			>
				Gateway
			</a>
		</div>
	</div>

	<!-- Mobile menu -->
	{#if open}
		<div class="sm:hidden mt-3 pt-3 border-t border-zinc-800 flex flex-col gap-2 text-sm">
			<a
				href="/"
				class="py-1.5 transition-colors {page.url.pathname === '/'
					? 'text-white'
					: 'text-zinc-400 hover:text-white'}"
				onclick={() => (open = false)}
			>
				Home
			</a>
			<a
				href="/videos"
				class="py-1.5 transition-colors {page.url.pathname.startsWith('/videos')
					? 'text-white'
					: 'text-zinc-400 hover:text-white'}"
				onclick={() => (open = false)}
			>
				Reviews
			</a>
			<a
				href="/queue"
				class="py-1.5 transition-colors {page.url.pathname.startsWith('/queue')
					? 'text-white'
					: 'text-zinc-400 hover:text-white'}"
				onclick={() => (open = false)}
			>
				Queue
			</a>
			<a
				href="/journal"
				class="py-1.5 transition-colors {page.url.pathname.startsWith('/journal')
					? 'text-white'
					: 'text-zinc-400 hover:text-white'}"
				onclick={() => (open = false)}
			>
				Journal
			</a>
			<a
				href="/gateway"
				class="py-1.5 transition-colors {page.url.pathname.startsWith('/gateway')
					? 'text-white'
					: 'text-zinc-400 hover:text-white'}"
				onclick={() => (open = false)}
			>
				Gateway
			</a>
		</div>
	{/if}
</nav>
