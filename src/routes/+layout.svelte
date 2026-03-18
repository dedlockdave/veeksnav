<script lang="ts">
	import '../app.css';
	import Nav from '$lib/components/Nav.svelte';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>VeeksNav</title>
</svelte:head>

<div class="min-h-screen bg-zinc-950 text-zinc-100">
	<Nav />
	<main class="max-w-7xl mx-auto px-6 py-8">
		{@render children()}
	</main>
</div>
