<script lang="ts">
	/**
	 * Badge Component
	 * Displays status badges and tags
	 */

	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'success' | 'warning' | 'error' | 'info';
	type Size = 'sm' | 'md';

	interface Props {
		/** Badge variant */
		variant?: Variant;
		/** Badge size */
		size?: Size;
		/** Custom CSS classes */
		class?: string;
		/** Badge content */
		children?: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		class: className = '',
		children
	}: Props = $props();

	const variantClasses: Record<Variant, string> = {
		primary: 'badge-primary',
		success: 'badge-success',
		warning: 'badge-warning',
		error: 'badge-error',
		info: 'badge-info'
	};

	const sizeClass = $derived(size === 'sm' ? 'badge-sm' : 'badge');
</script>

<span class="{sizeClass} {variantClasses[variant]} {className}">
	{@render children?.()}
</span>
