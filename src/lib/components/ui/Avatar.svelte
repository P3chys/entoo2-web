<script lang="ts">
	/**
	 * Avatar Component
	 * Displays a user avatar with fallback initials
	 */

	type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

	interface Props {
		/** Display name for fallback initials */
		name?: string;
		/** Image URL (not yet implemented) */
		src?: string;
		/** Size variant */
		size?: Size;
		/** Custom CSS classes */
		class?: string;
		/** Whether to show anonymous placeholder */
		anonymous?: boolean;
	}

	let {
		name = '',
		src = undefined,
		size = 'md',
		class: className = '',
		anonymous = false
	}: Props = $props();

	const sizeClasses: Record<Size, string> = {
		xs: 'w-6 h-6 text-xs',
		sm: 'w-8 h-8 text-sm',
		md: 'w-10 h-10 text-base',
		lg: 'w-12 h-12 text-lg',
		xl: 'w-16 h-16 text-xl'
	};

	// Get initials from name
	const initials = $derived(
		anonymous
			? '?'
			: name
					.split(' ')
					.map((part) => part.charAt(0))
					.join('')
					.toUpperCase()
					.slice(0, 2) || '?'
	);
</script>

<div
	class="rounded-full bg-accent-primary/20 flex-center font-bold text-accent-primary {sizeClasses[
		size
	]} {className}"
	title={anonymous ? 'Anonymous' : name}
>
	{#if src}
		<img {src} alt={name} class="w-full h-full rounded-full object-cover" />
	{:else}
		{initials}
	{/if}
</div>
