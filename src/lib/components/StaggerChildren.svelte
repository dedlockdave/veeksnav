<script lang="ts">
	import { Motion } from 'svelte-motion';

	let {
		children,
		stagger = 0.1,
		delayStart = 0,
		class: className = ''
	}: {
		children: any;
		stagger?: number;
		delayStart?: number;
		class?: string;
	} = $props();
</script>

<Motion
	initial="hidden"
	whileInView="visible"
	viewport={{ once: true, amount: 0.1 }}
	variants={{
		hidden: {},
		visible: {
			transition: {
				staggerChildren: stagger,
				delayChildren: delayStart
			}
		}
	}}
	let:motion
>
	<div use:motion class={className}>
		{@render children()}
	</div>
</Motion>
