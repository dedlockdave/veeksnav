<script lang="ts">
	import { Motion } from 'svelte-motion';

	let {
		children,
		delay = 0,
		duration = 0.7,
		y = 40,
		x = 0,
		once = true,
		scale = 1,
		blur = 0,
		class: className = ''
	}: {
		children: any;
		delay?: number;
		duration?: number;
		y?: number;
		x?: number;
		once?: boolean;
		scale?: number;
		blur?: number;
		class?: string;
	} = $props();
</script>

<Motion
	initial={{ opacity: 0, y, x, scale, filter: blur ? `blur(${blur}px)` : 'blur(0px)' }}
	whileInView={{ opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)' }}
	viewport={{ once, amount: 0.15 }}
	transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
	let:motion
>
	<div use:motion class={className}>
		{@render children()}
	</div>
</Motion>
