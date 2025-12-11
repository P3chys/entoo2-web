<script lang="ts">
	import { _ } from 'svelte-i18n';
	import Card from '$components/Card.svelte';
	import { isAdmin } from '$stores/auth';
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">{$_('semesters.title')}</h1>
		{#if $isAdmin}
			<button class="btn btn-primary">
				{$_('semesters.create')}
			</button>
		{/if}
	</div>

	<Card>
		<div class="text-center py-12 text-light-text-secondary dark:text-dark-text-secondary">
			<p>{$_('semesters.noSemesters')}</p>
			{#if $isAdmin}
				<p class="text-sm mt-2">Create your first semester to get started</p>
			{/if}
		</div>
	</Card>
</div>
