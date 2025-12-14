<script lang="ts">
	import { themeStore } from '$stores/theme';
	import { _ } from 'svelte-i18n';
	import Icon from './Icon.svelte';
	import { particleBurst } from '$lib/utils/animation';

	let theme = $derived($themeStore);
	let isAnimating = $state(false);
	let buttonElement: HTMLButtonElement;

	async function toggle() {
		// Trigger particle burst animation
		if (buttonElement) {
			particleBurst(buttonElement, 12);
		}

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
	bind:this={buttonElement}
	onclick={toggle}
	disabled={isAnimating}
	class="p-2 rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-all duration-200 hover:scale-110 active:scale-95 relative overflow-visible {isAnimating ? 'pointer-events-none' : ''}"
	aria-label={$_('theme.toggle')}
	title={theme === 'dark' ? $_('theme.light') : $_('theme.dark')}
>
	<div class="relative z-10 transition-all duration-500 {isAnimating ? 'rotate-180 scale-125' : 'rotate-0 scale-100'}">
		{#if theme === 'dark'}
			<Icon name="sun" size={20} className="text-yellow-500" />
		{:else}
			<Icon name="moon" size={20} className="text-indigo-500" />
		{/if}
	</div>

	<!-- Glow effect overlay -->
	{#if isAnimating}
		<div class="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-purple-400/30 dark:from-indigo-400/30 dark:via-purple-400/30 dark:to-pink-400/30 animate-ping rounded-lg"></div>
	{/if}
</button>
