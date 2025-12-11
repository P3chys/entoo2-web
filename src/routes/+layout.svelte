<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { locale, waitLocale } from 'svelte-i18n';
	import { browser } from '$app/environment';
	import { themeStore } from '$stores/theme';
	import '$lib/i18n';

	let theme = $state($themeStore);

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

<div class="min-h-screen">
	<slot />
</div>
