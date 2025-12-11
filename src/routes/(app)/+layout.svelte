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
		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<slot />
		</main>
	</div>
{:else}
	<div class="min-h-screen flex items-center justify-center">
		<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
	</div>
{/if}
