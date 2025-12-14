<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore, isAuthenticated } from '$stores/auth';
	import Navbar from '$components/Navbar.svelte';

	onMount(async () => {
		await authStore.initialize();

		if (!$isAuthenticated) {
			goto('/login');
		}
	});
</script>

{#if $isAuthenticated}
	<div class="min-h-screen">
		<Navbar />
		<main id="main-content" class="w-full px-6 sm:px-8 lg:px-12 xl:px-16 py-8" tabindex="-1">
			<slot />
		</main>
	</div>
{:else}
	<div class="min-h-screen flex items-center justify-center">
		<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
	</div>
{/if}
