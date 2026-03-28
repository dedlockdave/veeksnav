<script lang="ts">
	import { videos } from '$lib/data/videos';
	import { Motion } from 'svelte-motion';
	import AnimateIn from '$lib/components/AnimateIn.svelte';

	const reviewCount = videos.filter((v) => v.status === 'review').length;

	const tagline = 'REVIEW. ANALYZE. PUBLISH.';
	const tagChars = tagline.split('');
</script>

<div class="relative overflow-hidden">
	<!-- Cinematic ambient glow -->
	<div class="absolute inset-0 pointer-events-none">
		<div
			class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[120px]"
		></div>
		<div
			class="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-violet-600/6 rounded-full blur-[100px]"
		></div>
		<div
			class="absolute top-1/2 right-0 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[80px]"
		></div>
	</div>

	<!-- Film grain overlay -->
	<div class="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')]"></div>

	<!-- Hero section -->
	<section class="relative min-h-[85vh] flex flex-col items-center justify-center px-4 py-20">
		<!-- Main title -->
		<Motion
			initial={{ opacity: 0, y: 60, scale: 0.9 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
			let:motion
		>
			<h1 use:motion class="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-center leading-[0.9]">
				<span class="block text-white">Veeks</span>
				<span class="block bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">Nav</span>
			</h1>
		</Motion>

		<!-- Tagline with letter-by-letter reveal -->
		<div class="mt-8 flex gap-[2px] justify-center overflow-hidden">
			{#each tagChars as char, i}
				<Motion
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.8 + i * 0.03, ease: [0.22, 1, 0.36, 1] }}
					let:motion
				>
					<span
						use:motion
						class="text-sm sm:text-base tracking-[0.3em] font-medium {char === '.'
							? 'text-indigo-400'
							: 'text-zinc-500'}"
					>
						{char === ' ' ? '\u00A0' : char}
					</span>
				</Motion>
			{/each}
		</div>

		<!-- Subtitle -->
		<Motion
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.9, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
			let:motion
		>
			<p use:motion class="mt-8 text-zinc-400 text-base sm:text-lg max-w-lg text-center leading-relaxed">
				Content review dashboard for bodycam footage analysis.
				<span class="text-zinc-300">Extract clips. Score conduct. Publish stories.</span>
			</p>
		</Motion>

		<!-- CTA Button -->
		<Motion
			initial={{ opacity: 0, y: 30, scale: 0.9 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ duration: 0.8, delay: 2, ease: [0.22, 1, 0.36, 1] }}
			let:motion
		>
			<div use:motion class="mt-10">
				<a
					href="/videos"
					class="group relative inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.3)] hover:scale-[1.02]"
				>
					{#if reviewCount > 0}
						<span class="relative">
							Review Content
							<span
								class="ml-2 inline-flex items-center justify-center bg-white/20 text-xs font-bold rounded-full w-6 h-6"
							>
								{reviewCount}
							</span>
						</span>
					{:else}
						Browse Reviews
					{/if}
					<svg
						class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
					</svg>
				</a>
			</div>
		</Motion>

		<!-- Scroll indicator -->
		<Motion
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 1, delay: 2.8 }}
			let:motion
		>
			<div use:motion class="absolute bottom-8 left-1/2 -translate-x-1/2">
				<div class="flex flex-col items-center gap-2 text-zinc-600">
					<span class="text-xs tracking-widest uppercase">Scroll</span>
					<div class="w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent animate-pulse"></div>
				</div>
			</div>
		</Motion>
	</section>

	<!-- Stats section - reveals on scroll -->
	<section class="relative py-20 border-t border-zinc-800/50">
		<div class="max-w-4xl mx-auto px-4">
			<AnimateIn y={50} duration={0.8}>
				<h2 class="text-2xl sm:text-3xl font-bold text-center text-white mb-12">
					The Pipeline
				</h2>
			</AnimateIn>

			<div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
				<AnimateIn y={40} delay={0.1}>
					<div class="text-center p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
						<div class="text-4xl font-black text-indigo-400 mb-2">{videos.length}</div>
						<div class="text-sm text-zinc-400 uppercase tracking-wider">Videos Ingested</div>
					</div>
				</AnimateIn>
				<AnimateIn y={40} delay={0.25}>
					<div class="text-center p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
						<div class="text-4xl font-black text-violet-400 mb-2">
							{videos.reduce((sum, v) => sum + v.clips.length, 0)}
						</div>
						<div class="text-sm text-zinc-400 uppercase tracking-wider">Clips Extracted</div>
					</div>
				</AnimateIn>
				<AnimateIn y={40} delay={0.4}>
					<div class="text-center p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
						<div class="text-4xl font-black text-blue-400 mb-2">
							{videos.reduce((sum, v) => sum + v.analysis.postDrafts.length, 0)}
						</div>
						<div class="text-sm text-zinc-400 uppercase tracking-wider">Drafts Ready</div>
					</div>
				</AnimateIn>
			</div>
		</div>
	</section>

	<!-- Workflow section -->
	<section class="relative py-20">
		<div class="max-w-3xl mx-auto px-4">
			<AnimateIn y={50} duration={0.8}>
				<h2 class="text-2xl sm:text-3xl font-bold text-center text-white mb-16">
					How It Works
				</h2>
			</AnimateIn>

			<div class="space-y-16">
				{#each [
					{ step: '01', title: 'Ingest', desc: 'Bodycam footage enters the pipeline. AI extracts clips, scores officer conduct, and identifies teachable moments.', icon: '🎬' },
					{ step: '02', title: 'Review', desc: 'Human reviewers accept, edit, or skip clips. Trim boundaries. Adjust scores. The human stays in the loop.', icon: '🔍' },
					{ step: '03', title: 'Publish', desc: 'Approved clips flow to the export queue. The post-creation agent picks them up and publishes across platforms.', icon: '🚀' }
				] as item, i}
					<AnimateIn x={i % 2 === 0 ? -60 : 60} y={20} delay={0.1 * i} duration={0.9}>
						<div class="flex gap-6 items-start">
							<div class="shrink-0 w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl">
								{item.icon}
							</div>
							<div>
								<div class="text-xs text-indigo-400 font-mono tracking-wider mb-1">STEP {item.step}</div>
								<h3 class="text-xl font-bold text-white mb-2">{item.title}</h3>
								<p class="text-zinc-400 leading-relaxed">{item.desc}</p>
							</div>
						</div>
					</AnimateIn>
				{/each}
			</div>
		</div>
	</section>

	<!-- Bottom CTA -->
	<section class="relative py-20 border-t border-zinc-800/50">
		<AnimateIn y={40} duration={0.8}>
			<div class="text-center">
				<a
					href="/videos"
					class="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-lg font-medium transition-colors"
				>
					Start Reviewing
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
					</svg>
				</a>
			</div>
		</AnimateIn>
	</section>
</div>
