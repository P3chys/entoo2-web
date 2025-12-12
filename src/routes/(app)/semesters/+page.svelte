<script lang="ts">
	import { _ } from 'svelte-i18n';
	import Button from '$components/Button.svelte';
	import { isAdmin } from '$stores/auth';
	import { fade } from 'svelte/transition';
</script>

<div class="space-y-6" in:fade={{ duration: 200 }}>
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<h1 class="text-3xl font-bold">{$_('semesters.title')}</h1>
		{#if $isAdmin}
			<Button variant="primary">
				<span class="mr-2">➕</span>
				{$_('semesters.create')}
			</Button>
		{/if}
	</div>

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
				d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
			/>
		</svg>

		<h3 class="empty-title">{$_('semesters.noSemesters')}</h3>
		{#if $isAdmin}
			<p class="empty-description">
				Create your first semester to start organizing your study materials and courses.
			</p>
			<div class="flex gap-3 justify-center">
				<Button variant="primary" size="lg">
					<span class="mr-2">➕</span>
					Create First Semester
				</Button>
			</div>
		{:else}
			<p class="empty-description">
				No semesters have been created yet. Contact an administrator to set up semesters.
			</p>
		{/if}
	</div>
</div>
