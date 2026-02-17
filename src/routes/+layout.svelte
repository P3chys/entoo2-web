<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { locale, waitLocale } from 'svelte-i18n';
	import { browser } from '$app/environment';
	import { themeStore } from '$stores/theme';
	import '$lib/i18n';
	import ToastContainer from '$lib/components/ToastContainer.svelte';

	let { children } = $props();

	let theme = $derived($themeStore);

	// Apply theme class to document
	$effect(() => {
		if (browser) {
			if (theme === 'dark') {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		}
	});

	onMount(async () => {
		await waitLocale();
	});
</script>

<div
	class="min-h-screen flex flex-col relative overflow-x-hidden bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary transition-colors duration-300"
>
	{@render children?.()}
	<ToastContainer />
</div>

<style>
	:global(.animate-fade-in) {
		animation: fadeIn 0.5s ease-out forwards;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
