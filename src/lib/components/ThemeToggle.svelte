<script lang="ts">
	import { themeStore } from '$stores/theme';
	import { _ } from 'svelte-i18n';

	let theme = $derived($themeStore);
	let isAnimating = $state(false);

	async function toggle() {
		// Check if View Transitions API is supported
		if (typeof document !== 'undefined' && 'startViewTransition' in document) {
			isAnimating = true;
			// @ts-ignore - View Transitions API
			await document.startViewTransition(() => {
				themeStore.toggle();
			}).finished;
			isAnimating = false;
		} else {
			themeStore.toggle();
		}
	}
</script>

<button
	onclick={toggle}
	disabled={isAnimating}
	class="p-2 rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-all duration-200 hover:scale-110 active:scale-95 relative overflow-hidden {isAnimating ? 'pointer-events-none' : ''}"
	aria-label={$_('theme.toggle')}
	title={theme === 'dark' ? $_('theme.light') : $_('theme.dark')}
>
	<div class="relative z-10">
		{#if theme === 'dark'}
			<!-- Sun icon -->
			<svg
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5 transition-all duration-500 {isAnimating ? 'rotate-180 scale-125' : 'rotate-0 scale-100'}"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
				/>
			</svg>
		{:else}
			<!-- Moon icon -->
			<svg
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5 transition-all duration-500 {isAnimating ? 'rotate-0 scale-125' : '-rotate-90 scale-100'}"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
				/>
			</svg>
		{/if}
	</div>

	<!-- Ripple effect overlay -->
	{#if isAnimating}
		<div class="absolute inset-0 bg-accent-primary/20 dark:bg-accent-light/20 animate-ping rounded-lg"></div>
	{/if}
</button>
