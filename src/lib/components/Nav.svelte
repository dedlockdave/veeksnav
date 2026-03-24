<script lang="ts">
	import { page } from '$app/state';
</script>

<nav class="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
	<div class="max-w-7xl mx-auto flex items-center justify-between">
		<a href="/" class="text-xl font-bold text-white tracking-tight">
			Veeks<span class="text-indigo-400">Nav</span>
		</a>
		<div class="flex gap-6 text-sm">
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
		</div>
	</div>
</nav>
