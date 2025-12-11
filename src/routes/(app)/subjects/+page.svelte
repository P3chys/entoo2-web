<script lang="ts">
	import { _ } from 'svelte-i18n';
	import Card from '$components/Card.svelte';
	import Input from '$components/Input.svelte';
	import { isAdmin } from '$stores/auth';

	let searchQuery = $state('');
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">{$_('subjects.title')}</h1>
		{#if $isAdmin}
			<button class="btn btn-primary">
				{$_('subjects.create')}
			</button>
		{/if}
	</div>

	<Input
		type="search"
		bind:value={searchQuery}
		placeholder={$_('search.placeholder')}
	/>

	<Card>
		<div class="text-center py-12 text-light-text-secondary dark:text-dark-text-secondary">
			<p>{$_('subjects.noSubjects')}</p>
			<p class="text-sm mt-2">Subjects will appear here once semesters are created</p>
		</div>
	</Card>
</div>
