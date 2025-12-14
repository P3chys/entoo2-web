<script lang="ts">
	import { _ } from 'svelte-i18n';
    import { clickPulse, hoverScale, rippleEffect } from '$lib/utils/animation';

	interface Props {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		type?: 'button' | 'submit' | 'reset';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		loading?: boolean;
		fullWidth?: boolean;
		ariaLabel?: string;
		class?: string;
		onclick?: () => void;
		children?: any;
	}

	let {
		variant = 'primary',
		type = 'button',
		size = 'md',
		disabled = false,
		loading = false,
		fullWidth = false,
		ariaLabel = '',
		class: className = '',
		onclick,
		children
	}: Props = $props();

	const variantClasses = {
		primary: 'btn-primary',
		secondary: 'btn-secondary',
		ghost: 'btn-ghost',
		danger: 'btn-danger'
	};

	const sizeClasses = {
		sm: 'text-xs px-3 py-1.5',
		md: 'text-sm px-4 py-2',
		lg: 'text-base px-6 py-3'
	};
</script>

<button
	{type}
	class="btn {variantClasses[variant]} {sizeClasses[size]} {fullWidth ? 'w-full' : ''} {className}"
	disabled={disabled || loading}
	aria-busy={loading}
	aria-label={ariaLabel}
	onclick={onclick}
    use:rippleEffect
    use:clickPulse
    use:hoverScale
>
	{#if loading}
		<span role="status" aria-label={$_('common.loading')}>
			<svg
				aria-hidden="true"
				class="animate-spin -ml-1 mr-2 h-4 w-4"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
		</span>
	{/if}
	{@render children?.()}
</button>
