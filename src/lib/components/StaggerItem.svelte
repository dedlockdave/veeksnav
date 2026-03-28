<script lang="ts">
	import { Motion } from 'svelte-motion';

	let {
		children,
		y = 30,
		x = 0,
		scale = 0.95,
		duration = 0.6,
		class: className = ''
	}: {
		children: any;
		y?: number;
		x?: number;
		scale?: number;
		duration?: number;
		class?: string;
	} = $props();
</script>

<Motion
	variants={{
		hidden: { opacity: 0, y, x, scale },
		visible: { opacity: 1, y: 0, x: 0, scale: 1 }
	}}
	transition={{ duration, ease: [0.25, 0.46, 0.45, 0.94] }}
	let:motion
>
	<div use:motion class={className}>
		{@render children()}
	</div>
</Motion>
