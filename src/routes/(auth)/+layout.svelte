<script lang="ts">
	import ThemeToggle from '$components/ThemeToggle.svelte';
	import LanguageSelector from '$components/LanguageSelector.svelte';
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { isAuthenticated } from '$stores/auth';
	import { onMount } from 'svelte';

	onMount(() => {
		if ($isAuthenticated) {
			goto('/');
		}
	});
</script>

<div class="min-h-screen flex items-center justify-center p-4">
	<div class="absolute top-4 right-4 flex items-center gap-2">
		<LanguageSelector />
		<ThemeToggle />
	</div>

	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold mb-2 text-accent-primary">{$_('common.appName')}</h1>
			<p class="text-light-text-secondary dark:text-dark-text-secondary">
				Document sharing platform for law students
			</p>
		</div>

		<slot />
	</div>
</div>
