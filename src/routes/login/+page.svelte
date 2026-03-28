<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	import { Motion } from 'svelte-motion';
</script>

<svelte:head>
	<title>Sign In — VeeksNav</title>
</svelte:head>

<div class="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative overflow-hidden">
	<!-- Ambient glow -->
	<div class="absolute inset-0 pointer-events-none">
		<div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[120px]"></div>
	</div>

	<div class="w-full max-w-sm relative z-10">
		<Motion
			initial={{ opacity: 0, y: 40, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
			let:motion
		>
			<div use:motion class="text-center mb-10">
				<h1 class="text-4xl font-black text-white tracking-tighter">
					Veeks<span class="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Nav</span>
				</h1>
				<p class="text-zinc-500 text-sm mt-3">Sign in to continue</p>
			</div>
		</Motion>

		<Motion
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
			let:motion
		>
			<button
				use:motion
				onclick={() => signIn('google', { callbackUrl: '/' })}
				class="w-full flex items-center justify-center gap-3 bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/60 text-zinc-200 rounded-xl px-4 py-4 text-sm font-medium hover:bg-zinc-800 hover:border-zinc-600 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] transition-all duration-300 cursor-pointer"
			>
				<svg class="w-5 h-5" viewBox="0 0 24 24">
					<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
					<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
					<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
					<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
				</svg>
				Sign in with Google
			</button>
		</Motion>
	</div>
</div>
