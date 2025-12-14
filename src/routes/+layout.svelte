<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { locale, waitLocale } from 'svelte-i18n';
	import { browser } from '$app/environment';
	import ConstellationBackground from '$lib/components/ConstellationBackground.svelte';
    import { themeStore } from '$stores/theme';
    import '$lib/i18n';

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

<div class="min-h-screen flex flex-col relative overflow-x-hidden">
    <main class="flex-1 container mx-auto px-4 py-8 relative z-10">
        <!-- Add a subtle entry animation for page content -->
	    <div class="animate-fade-in">
	        {@render children?.()}
        </div>
    </main>
    <ConstellationBackground />
</div>

<style>
    :global(.animate-fade-in) {
        animation: fadeIn 0.5s ease-out forwards;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
</style>
