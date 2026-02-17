<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore, isAuthenticated } from '$stores/auth';
	import Navbar from '$components/Navbar.svelte';
	import ConstellationBackground from '$components/ConstellationBackground.svelte';

	onMount(async () => {
		await authStore.initialize();

		if (!$isAuthenticated) {
			goto('/login');
		}
	});
</script>

{#if $isAuthenticated}
	<div class="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary relative">
		<ConstellationBackground />
		<div class="relative z-10">
			<Navbar />
			<main id="main-content" class="w-full px-4 sm:px-6 md:px-8 py-4" tabindex="-1">
				<slot />
			</main>
		</div>
	</div>
{:else}
	<div
		class="min-h-screen flex items-center justify-center bg-light-bg-primary dark:bg-dark-bg-primary"
	>
		<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
	</div>
{/if}
