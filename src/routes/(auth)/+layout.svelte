<script lang="ts">
	import ThemeToggle from '$components/ThemeToggle.svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated } from '$stores/auth';
	import { onMount } from 'svelte';

	onMount(() => {
		if ($isAuthenticated) {
			goto('/');
		}
	});
</script>

<div class="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary">
	<div class="fixed top-4 right-4 z-50 flex items-center gap-2">
		<ThemeToggle />
	</div>

	<slot />
</div>
