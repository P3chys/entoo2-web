<script lang="ts">
	import { _ } from 'svelte-i18n';
	import Input from '$components/Input.svelte';
	import Button from '$components/Button.svelte';
	import { isAdmin } from '$stores/auth';
	import { fade } from 'svelte/transition';

	let searchQuery = $state('');
</script>

<div class="space-y-6" in:fade={{ duration: 200 }}>
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<h1 class="text-3xl font-bold">{$_('subjects.title')}</h1>
		{#if $isAdmin}
			<Button variant="primary">
				<span class="mr-2">➕</span>
				{$_('subjects.create')}
			</Button>
		{/if}
	</div>

	<Input type="search" bind:value={searchQuery} placeholder={$_('search.placeholder')} />

	<!-- Empty State -->
	<div class="empty-state">
		<svg
			class="empty-icon"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
			/>
		</svg>

		<h3 class="empty-title">{$_('subjects.noSubjects')}</h3>
		<p class="empty-description">
			Subjects will appear here once semesters are created. Browse semesters to get started.
		</p>

		<div class="flex gap-3 justify-center">
			<a href="/semesters">
				<Button variant="primary">Browse Semesters</Button>
			</a>
		</div>
	</div>
</div>
