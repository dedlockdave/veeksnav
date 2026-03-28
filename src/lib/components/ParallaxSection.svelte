<script lang="ts">
	let {
		children,
		speed = 0.3,
		class: className = ''
	}: {
		children: any;
		speed?: number;
		class?: string;
	} = $props();

	let scrollY = $state(0);
	let el: HTMLDivElement | undefined = $state();

	function handleScroll() {
		scrollY = window.scrollY;
	}
</script>

<svelte:window onscroll={handleScroll} />

<div
	bind:this={el}
	class={className}
	style="transform: translateY({-scrollY * speed}px); will-change: transform;"
>
	{@render children()}
</div>
