<script lang="ts">
	import { fadeSlideIn, hoverScale } from '$lib/utils/animation';
	import { cardVariants, type CardVariants } from '$lib/utils/variants';

	interface Props extends CardVariants {
		class?: string;
		children?: any;
		interactive?: boolean;
	}

	let {
		class: className = '',
		variant = 'default',
		padding = 'md',
		interactive = false,
		children
	}: Props = $props();

	// Use interactive variant if interactive prop is true
	const finalVariant = interactive ? 'interactive' : variant;
</script>

<div
	class={cardVariants({ variant: finalVariant, padding, class: className })}
	use:fadeSlideIn
	use:hoverScale
>
	{@render children?.()}
</div>
