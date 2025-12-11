<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { currentUser } from '$stores/auth';
	import Card from '$components/Card.svelte';

	const stats = [
		{ label: $_('navigation.semesters'), value: '0', href: '/semesters' },
		{ label: $_('navigation.subjects'), value: '0', href: '/subjects' },
		{ label: $_('documents.title'), value: '0', href: '/subjects' },
		{ label: $_('navigation.favorites'), value: '0', href: '/favorites' }
	];
</script>

<div class="space-y-8">
	<!-- Welcome Section -->
	<div>
		<h1 class="text-3xl font-bold mb-2">
			{$_('navigation.home')}
		</h1>
		<p class="text-light-text-secondary dark:text-dark-text-secondary">
			Welcome back, {$currentUser?.email}
		</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		{#each stats as stat}
			<a href={stat.href} class="no-underline">
				<Card class="hover:shadow-lg transition-shadow cursor-pointer">
					<div class="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-2">
						{stat.label}
					</div>
					<div class="text-3xl font-bold text-accent-primary">{stat.value}</div>
				</Card>
			</a>
		{/each}
	</div>

	<!-- Recent Activity -->
	<Card>
		<h2 class="text-xl font-semibold mb-4">{$_('navigation.subjects')}</h2>
		<div class="text-center py-12 text-light-text-secondary dark:text-dark-text-secondary">
			<p>{$_('subjects.noSubjects')}</p>
			<p class="text-sm mt-2">Start by browsing semesters and subjects</p>
		</div>
	</Card>
</div>
